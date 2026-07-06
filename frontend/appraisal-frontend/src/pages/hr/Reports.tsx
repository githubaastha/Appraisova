import { useState, useEffect } from 'react'
import HRSidebar from '../../components/HRSidebar'
import CycleSelector from '../../components/manager/reports/CycleSelector'
import HRReportStatCards from '../../components/hr/reports/HRReportStatCards'
import StatusBreakdownChart from '../../components/hr/reports/StatusBreakdownChart'
import RatingDistributionChart from '../../components/hr/reports/RatingDistributionChart'
import { getLoggedInUser } from '../../utils/auth'
import { getAllAppraisals, exportAppraisalReport } from '../../api/appraisalApi'
import type { AppraisalStatus } from '../../types'

interface AppraisalRow {
    appraisalId: number
    employeeName: string
    department: string
    managerName: string
    cycleName: string
    status: AppraisalStatus
    createdAt: string
    managerRating: number | null
}

export default function Reports() {
    const { name, initials, role } = getLoggedInUser()
    const [selectedCycle, setSelectedCycle] = useState<string | null>(null)
    const [appraisals, setAppraisals] = useState<AppraisalRow[]>([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState('')

    useEffect(() => {
        setLoading(true)
        getAllAppraisals()
            .then(data => {
                setAppraisals(data.map(a => ({
                    appraisalId: a.appraisalId,
                    employeeName: a.employeeName,
                    department: a.department,
                    managerName: a.managerName,
                    cycleName: a.cycleName,
                    status: a.appraisalStatus,
                    createdAt: a.createdAt,
                    managerRating: a.managerRating ?? null
                })))
            })
            .finally(() => setLoading(false))
    }, [])

    const cycles = Array.from(new Set(appraisals.map(a => a.cycleName)))

    const cycleAppraisals = selectedCycle
        ? appraisals.filter(a => a.cycleName === selectedCycle)
        : []

    const totalEmployees  = cycleAppraisals.length
    const completed       = cycleAppraisals.filter(a => a.status === 'ACKNOWLEDGED' || a.status === 'APPROVED').length
    const inProgress      = cycleAppraisals.filter(a => a.status !== 'ACKNOWLEDGED' && a.status !== 'APPROVED' && a.status !== 'PENDING').length
    const completionRate  = totalEmployees > 0 ? Math.round((completed / totalEmployees) * 100) : 0
    const approvedRatio   = `${completed}/${totalEmployees}`
    const ratings: (number | null)[] = cycleAppraisals
    .map(a => a.managerRating ?? null)
    .filter(r => r !== null)

    const handleDownloadReport = async () => {
        if (!selectedCycle) return

        try {
            setDownloading(true)
            setDownloadError('')

            const blob = await exportAppraisalReport(selectedCycle)

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${selectedCycle.replace(/\s+/g, '_')}_Report.xlsx`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
            setDownloadError('Failed to download report. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <HRSidebar name={name} initials={initials} role={role} activePage="Reports" />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="pb-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Reports</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Company-wide appraisal performance overview</p>
                            </div>

                            <button
                                onClick={handleDownloadReport}
                                disabled={!selectedCycle || downloading}
                                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                                    !selectedCycle || downloading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#1089D3] text-white hover:bg-[#0e7abf]'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                {downloading ? 'Downloading…' : 'Download Excel'}
                            </button>
                        </div>

                        {downloadError && (
                            <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                                {downloadError}
                            </p>
                        )}

                        <CycleSelector cycles={cycles} selectedCycle={selectedCycle} onSelect={setSelectedCycle} />

                        {selectedCycle === null ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                                <p className="text-sm text-gray-400">Select a cycle to view the company report</p>
                            </div>
                        ) : (
                            <>
                                <HRReportStatCards
                                    totalEmployees={totalEmployees}
                                    completionRate={completionRate}
                                    inProgress={inProgress}
                                    approvedRatio={approvedRatio}
                                />
                                <StatusBreakdownChart appraisals={cycleAppraisals} />
                                <RatingDistributionChart ratings={ratings} />
                            </>
                        )}
                    </>
                )}

            </div>
        </div>
    )
}