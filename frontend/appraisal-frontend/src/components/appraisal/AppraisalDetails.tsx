type AppraisalStatus =
    | 'PENDING'
    | 'EMPLOYEE_DRAFT'
    | 'SELF_SUBMITTED'
    | 'MANAGER_DRAFT'
    | 'MANAGER_REVIEWED'
    | 'APPROVED'
    | 'ACKNOWLEDGED'

interface Props {
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    managerName: string
    managerEmail: string
    status: AppraisalStatus
}

const STATUS_STYLES: Record<AppraisalStatus, { label: string; className: string }> = {
    PENDING:           { label: 'Pending',          className: 'bg-gray-100 text-gray-500' },
    EMPLOYEE_DRAFT:    { label: 'Draft',            className: 'bg-yellow-50 text-yellow-600' },
    SELF_SUBMITTED:    { label: 'Submitted',        className: 'bg-blue-50 text-[#1089D3]' },
    MANAGER_DRAFT:     { label: 'In Review',        className: 'bg-orange-50 text-orange-500' },
    MANAGER_REVIEWED:  { label: 'Reviewed',        className: 'bg-purple-50 text-purple-600' },
    APPROVED:          { label: 'Approved',         className: 'bg-green-50 text-green-600' },
    ACKNOWLEDGED:      { label: 'Acknowledged',     className: 'bg-green-100 text-green-700' },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function AppraisalDetails({
    cycleName, cycleStartDate, cycleEndDate, managerName, managerEmail, status
}: Props) {
    const style = STATUS_STYLES[status]

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Appraisal Details
                </p>
                <span className={`text-xs font-semibold px-3 rounded-full ${style.className}`}>
                    {style.label}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">

                {/* Cycle Name */}
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cycle</p>
                    <p className="text-sm font-semibold text-gray-700">{cycleName}</p>
                </div>

                {/* Manager */}
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Manager</p>
                    <p className="text-sm font-semibold text-gray-700">{managerName}</p>
                    <p className="text-xs text-gray-400">{managerEmail}</p>
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Start Date</p>
                    <p className="text-sm font-semibold text-gray-700">{formatDate(cycleStartDate)}</p>
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">End Date</p>
                    <p className="text-sm font-semibold text-gray-700">{formatDate(cycleEndDate)}</p>
                </div>

            </div>
        </div>
    )
}