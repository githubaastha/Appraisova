import type { AppraisalStatus } from '../../../types'

interface AppraisalRow {
    appraisalId: number
    employeeName: string
    department: string
    managerName: string
    managerId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    status: AppraisalStatus
    createdAt: string
}

interface Props {
    appraisals: AppraisalRow[]
    onApprove: (appraisal: AppraisalRow) => void
    onEdit: (appraisal: AppraisalRow) => void
}

const STATUS_CONFIG: Record<AppraisalStatus, { label: string; bg: string; text: string }> = {
    PENDING:          { label: 'Pending',          bg: '#FEF3C7', text: '#92400E' },
    EMPLOYEE_DRAFT:   { label: 'Draft',            bg: '#DBEAFE', text: '#1E40AF' },
    SELF_SUBMITTED:   { label: 'Self Submitted',   bg: '#EDE9FE', text: '#5B21B6' },
    MANAGER_DRAFT:    { label: 'Manager Draft',    bg: '#FEF3C7', text: '#92400E' },
    MANAGER_REVIEWED: { label: 'Manager Reviewed', bg: '#DBEAFE', text: '#1E40AF' },
    APPROVED:         { label: 'Approved',         bg: '#D1FAE5', text: '#065F46' },
    ACKNOWLEDGED:     { label: 'Acknowledged',     bg: '#F3F4F6', text: '#374151' },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function ManageAppraisalsTable({ appraisals, onApprove, onEdit }: Props) {
    if (appraisals.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No appraisals found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Employee</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Manager</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Department</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Cycle</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Last Updated</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appraisals.map(appraisal => {
                        const cfg            = STATUS_CONFIG[appraisal.status]
                        const canApprove     = appraisal.status === 'MANAGER_REVIEWED'
                        const canEdit        = appraisal.status === 'PENDING'

                        return (
                            <tr key={appraisal.appraisalId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">

                                {/* Employee */}
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                    {appraisal.employeeName}
                                </td>

                                {/* Manager */}
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {appraisal.managerName}
                                </td>

                                {/* Department */}
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {appraisal.department}
                                </td>

                                {/* Cycle */}
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {appraisal.cycleName}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    <span
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md"
                                        style={{ background: cfg.bg, color: cfg.text }}
                                    >
                                        {cfg.label}
                                    </span>
                                </td>

                                {/* Last Updated */}
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {formatDate(appraisal.createdAt)}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => canApprove && onApprove(appraisal)}
                                            disabled={!canApprove}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                ${canApprove
                                                    ? 'border-green-400 text-green-600 hover:bg-green-50'
                                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                }`}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => canEdit && onEdit(appraisal)}
                                            disabled={!canEdit}
                                            title={!canEdit ? 'Only PENDING appraisals can be edited' : ''}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                ${canEdit
                                                    ? 'border-[#1089D3] text-[#1089D3] hover:bg-blue-50'
                                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                }`}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}