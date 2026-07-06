import { useState, useRef } from 'react'
import { bulkUploadUsers, downloadUserUploadTemplate } from '../../../api/usersApi'
import type { BulkUserUploadResult } from '../../../types'

interface Props {
    onClose: () => void;
    onAdded: () => void;
}

export default function BulkUploadUsersModal({ onClose, onAdded }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [downloadingTemplate, setDownloadingTemplate] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<BulkUserUploadResult | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDownloadTemplate = async () => {
        try {
            setDownloadingTemplate(true)
            const blob = await downloadUserUploadTemplate()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'User_Upload_Template.xlsx'
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
            setError('Failed to download template')
        } finally {
            setDownloadingTemplate(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null

        if (selected && !selected.name.toLowerCase().endsWith('.xlsx')) {
            setError('Please upload a .xlsx file')
            setFile(null)
            return
        }

        setError('')
        setFile(selected)
        setResult(null)
    }

    const handleUpload = async () => {
        if (!file) return

        try {
            setUploading(true)
            setError('')

            const res = await bulkUploadUsers(file)
            setResult(res)

            if (res.successCount > 0) {
                onAdded()
            }
        } catch (err) {
            console.error(err)
            setError('Upload failed — check console for details')
        } finally {
            setUploading(false)
        }
    }

    const handleReset = () => {
        setFile(null)
        setResult(null)
        setError('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-lg flex flex-col gap-4 shadow-lg max-h-[85vh] overflow-auto">

                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">
                        Bulk Upload Users
                    </p>
                    <button
                        onClick={onClose}
                        className="text-gray-700 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                        {error}
                    </p>
                )}

                {!result && (
                    <>
                        <div className="flex flex-col gap-2 bg-blue-50 rounded-lg px-4 py-3">
                            <p className="text-xs text-gray-600">
                                Download the template, fill in employee details, then upload it back here.
                                Manager and Department fields use email/name — not IDs.
                            </p>
                            <button
                                onClick={handleDownloadTemplate}
                                disabled={downloadingTemplate}
                                className="self-start text-xs font-medium text-[#1089D3] hover:underline disabled:text-gray-400"
                            >
                                {downloadingTemplate ? 'Downloading…' : '↓ Download Template (.xlsx)'}
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-700">
                                Upload File
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#1089D3] file:text-white"
                            />
                            {file && (
                                <p className="text-[10px] text-gray-400">Selected: {file.name}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 rounded-lg border text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className={`flex-1 py-2 rounded-lg text-white transition-all ${
                                    !file || uploading
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-[#1089D3] hover:bg-[#0e7abf]'
                                }`}
                            >
                                {uploading ? 'Uploading…' : 'Upload'}
                            </button>
                        </div>
                    </>
                )}

                {result && (
                    <>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-center">
                                <p className="text-lg font-bold text-gray-700">{result.totalRows}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Rows</p>
                            </div>
                            <div className="bg-green-50 rounded-lg px-3 py-2.5 text-center">
                                <p className="text-lg font-bold text-green-600">{result.successCount}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Created</p>
                            </div>
                            <div className="bg-red-50 rounded-lg px-3 py-2.5 text-center">
                                <p className="text-lg font-bold text-red-500">{result.failureCount}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Failed</p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-gray-600">Errors</p>
                                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-52 overflow-auto">
                                    {result.errors.map((e, idx) => (
                                        <div key={idx} className="px-3 py-2 flex flex-col gap-0.5">
                                            <p className="text-xs font-medium text-gray-700">
                                                Row {e.rowNumber} — {e.email}
                                            </p>
                                            <p className="text-[11px] text-red-500">{e.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2 rounded-lg border text-gray-600"
                            >
                                Upload Another File
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 rounded-lg bg-[#1089D3] text-white hover:bg-[#0e7abf]"
                            >
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}