import type { AppraisalStatus } from '../../../types'

interface Props {
    appraisals: { status: AppraisalStatus }[]
}

const STATUS_ORDER: AppraisalStatus[] = [
    'PENDING', 'EMPLOYEE_DRAFT', 'SELF_SUBMITTED', 'MANAGER_DRAFT', 'MANAGER_REVIEWED', 'APPROVED', 'ACKNOWLEDGED'
]

const STATUS_STYLES: Record<AppraisalStatus, { label: string; color: string }> = {
    PENDING:          { label: 'Pending',          color: '#9ca3af' },
    EMPLOYEE_DRAFT:   { label: 'Draft',             color: '#eab308' },
    SELF_SUBMITTED:   { label: 'Self Submitted',    color: '#1089D3' },
    MANAGER_DRAFT:    { label: 'Manager Draft',     color: '#f97316' },
    MANAGER_REVIEWED: { label: 'Manager Reviewed',  color: '#a855f7' },
    APPROVED:         { label: 'Approved',          color: '#22c55e' },
    ACKNOWLEDGED:     { label: 'Acknowledged',      color: '#15803d' },
}

export default function StatusBreakdownChart({ appraisals }: Props) {
    const total = appraisals.length

    const counts = STATUS_ORDER.map(status => ({
        status,
        count: appraisals.filter(a => a.status === status).length,
    })).filter(s => s.count > 0)

    if (total === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No data available for this cycle</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-4">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Status Breakdown
            </p>

            <div className="flex flex-col gap-3">
                {counts.map(({ status, count }) => {
                    const style   = STATUS_STYLES[status]
                    const percent = Math.round((count / total) * 100)
                    return (
                        <div key={status} className="flex items-center gap-3">
                            <p className="text-xs text-gray-500 w-32 shrink-0">{style.label}</p>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${percent}%`, backgroundColor: style.color }}
                                />
                            </div>
                            <p className="text-xs font-semibold text-gray-700 w-10 text-right">{count}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}