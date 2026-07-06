import type { AppraisalStatus } from '../../../types'

interface TeamMemberReport {
    employeeId: number
    name: string
    jobTitle: string
    status: AppraisalStatus
    selfRating: number | null
    managerRating: number | null
    goalsCompleted: number
    goalsTotal: number
}

interface Props {
    members: TeamMemberReport[]
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

function StarRating({ rating }: { rating: number | null }) {
    if (rating === null) return <span className="text-sm text-gray-300">—</span>
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={star <= rating ? 'text-[#1089D3]' : 'text-gray-200'}>★</span>
            ))}
        </div>
    )
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function TeamReportTable({ members }: Props) {
    if (members.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No team members found for this cycle</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Team Members</p>
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Employee</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Job Title</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Self Rating</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">My Rating</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Goals</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => {
                        const style = STATUS_STYLES[member.status]
                        return (
                            <tr key={member.employeeId} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                            {getInitials(member.name)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{member.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">{member.jobTitle}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${style.className}`}>
                                        {style.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4"><StarRating rating={member.selfRating} /></td>
                                <td className="px-6 py-4"><StarRating rating={member.managerRating} /></td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {member.goalsCompleted}/{member.goalsTotal}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}