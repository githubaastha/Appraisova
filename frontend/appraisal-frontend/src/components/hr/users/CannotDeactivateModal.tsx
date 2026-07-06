import { useState } from 'react'
import { updateManager } from '../../../api/usersApi'
import type { UserResponseDTO } from '../../../types'

interface Props {
    manager: UserResponseDTO
    affectedEmployees: UserResponseDTO[]
    otherManagersInDept: UserResponseDTO[]
    onClose: () => void
    onReassigned: () => void
}

export default function CannotDeactivateModal({
    manager, affectedEmployees, otherManagersInDept, onClose, onReassigned,
}: Props) {
    const [newManagerId, setNewManagerId] = useState<number | ''>('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const managerName = `${manager.firstName} ${manager.lastName}`

    const handleReassign = async () => {
        if (!newManagerId) return setError('Please select a manager to reassign these employees to')

        try {
            setLoading(true)
            await Promise.all(
                affectedEmployees.map(emp => updateManager(emp.userId!, Number(newManagerId)))
            )
            onReassigned()
            onClose()
        } catch (err) {
            console.error('Failed to reassign employees:', err)
            setError('Something went wrong while reassigning. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Cannot Deactivate Manager</p>
                        <p className="text-xs text-gray-400 mt-0.5">{managerName} has active employees reporting to them</p>
                    </div>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium text-gray-500">Affected Employees</p>
                    <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                        {affectedEmployees.map(emp => (
                            <div key={emp.userId} className="text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                                {emp.firstName} {emp.lastName}
                            </div>
                        ))}
                    </div>
                </div>

                {otherManagersInDept.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500">
                                Reassign to another manager in {manager.deptName}
                            </label>
                            <select
                                value={newManagerId}
                                onChange={(e) => setNewManagerId(e.target.value === '' ? '' : Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                            >
                                <option value="">Select a manager</option>
                                {otherManagersInDept.map(m => (
                                    <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName}</option>
                                ))}
                            </select>
                        </div>

                        {error && <p className="text-xs text-red-500">{error}</p>}

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReassign}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Reassigning...' : 'Reassign & Deactivate'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-600">
                            There is no other manager in <strong>{manager.deptName}</strong> to reassign these employees to. Please add another manager to this department first, or manually reassign these employees individually.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                        >
                            Got it
                        </button>
                    </>
                )}

            </div>
        </div>
    )
}