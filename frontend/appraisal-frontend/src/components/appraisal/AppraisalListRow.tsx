import { useNavigate } from 'react-router-dom'
import type { AppraisalStatus } from '../../types'

interface Props {
    appraisalId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    status: AppraisalStatus
    basePath: string
}

const STATUS_STYLES: Record<AppraisalStatus, { label: string; className: string }> = {
    PENDING:           { label: 'Pending',      className: 'bg-gray-100 text-gray-500' },
    EMPLOYEE_DRAFT:    { label: 'Draft',        className: 'bg-yellow-50 text-yellow-600' },
    SELF_SUBMITTED:    { label: 'Submitted',    className: 'bg-blue-50 text-[#1089D3]' },
    MANAGER_DRAFT:     { label: 'In Review',    className: 'bg-orange-50 text-orange-500' },
    MANAGER_REVIEWED:  { label: 'Reviewed',     className: 'bg-purple-50 text-purple-600' },
    APPROVED:          { label: 'Approved',     className: 'bg-green-50 text-green-600' },
    ACKNOWLEDGED:      { label: 'Acknowledged', className: 'bg-green-100 text-green-700' },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function AppraisalListRow({ appraisalId, cycleName, cycleStartDate, cycleEndDate, status, basePath }: Props) {
    const navigate = useNavigate()
    const style = STATUS_STYLES[status]

    return (
        <div
            onClick={() => navigate(`${basePath}/${appraisalId}`)}
            className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all"
        >
            <div>
                <p className="text-sm font-semibold text-gray-700">{cycleName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(cycleStartDate)} – {formatDate(cycleEndDate)}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${style.className}`}>
                    {style.label}
                </span>
                <button className="flex items-center gap-1 text-xs font-medium text-[#1089D3]">
                    View
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    )
}