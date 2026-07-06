import { useState } from 'react'
import type { AppraisalStatus } from '../../../types'

interface Appraisal {
    appraisalId: number
    employeeName: string
    department: string
    managerName: string
    cycleName: string
    status: AppraisalStatus
    createdAt: string
}

interface Props {
    appraisals: Appraisal[]
    onApprove?: (appraisal: Appraisal) => void
}

const STATUS_STYLES: Record<AppraisalStatus, { label: string; className: string }> = {
    PENDING:          { label: 'Pending',          className: 'bg-gray-100 text-gray-500' },
    EMPLOYEE_DRAFT:   { label: 'Draft',            className: 'bg-yellow-50 text-yellow-600' },
    SELF_SUBMITTED:   { label: 'Self Submitted',   className: 'bg-blue-50 text-[#1089D3]' },
    MANAGER_DRAFT:    { label: 'Manager Draft',    className: 'bg-orange-50 text-orange-500' },
    MANAGER_REVIEWED: { label: 'Manager Reviewed', className: 'bg-purple-50 text-purple-600' },
    APPROVED:         { label: 'Approved',         className: 'bg-green-50 text-green-600' },
    ACKNOWLEDGED:     { label: 'Acknowledged',     className: 'bg-green-100 text-green-700' },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function AllAppraisalsTable({ appraisals, onApprove }: Props) {
    const [statusFilter, setStatusFilter]         = useState<AppraisalStatus | 'ALL'>('ALL')
    const [departmentFilter, setDepartmentFilter] = useState<string>('ALL')
    const [cycleFilter, setCycleFilter]           = useState<string>('ALL')

    const departments = Array.from(new Set(appraisals.map(a => a.department)))
    const cycles      = Array.from(new Set(appraisals.map(a => a.cycleName)))

    const filtered = appraisals.filter(a => {
        if (statusFilter !== 'ALL' && a.status !== statusFilter) return false
        if (departmentFilter !== 'ALL' && a.department !== departmentFilter) return false
        if (cycleFilter !== 'ALL' && a.cycleName !== cycleFilter) return false
        return true
    })

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    All Appraisals
                </p>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as AppraisalStatus | 'ALL')}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        {Object.entries(STATUS_STYLES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none cursor-pointer"
                    >
                        <option value="ALL">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                        value={cycleFilter}
                        onChange={(e) => setCycleFilter(e.target.value)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none cursor-pointer"
                    >
                        <option value="ALL">All Cycles</option>
                        {cycles.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <p className="text-sm text-gray-400">No appraisals match the selected filters</p>
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Employee</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Department</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Manager</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Cycle</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Created</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(a => {
                            const style = STATUS_STYLES[a.status]
                            return (
                                <tr key={a.appraisalId} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{a.employeeName}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{a.department}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{a.managerName}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{a.cycleName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${style.className}`}>
                                            {style.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{formatDate(a.createdAt)}</td>
                                    <td className="px-6 py-4">
                                        {a.status === 'MANAGER_REVIEWED' ? (
                                            <button
                                                onClick={() => onApprove?.(a)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                                            >
                                                Approve
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-300">—</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}