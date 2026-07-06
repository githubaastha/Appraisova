import { useNavigate } from 'react-router-dom'
import type { AppraisalStatus } from '../../../types'

interface Props {
    employeeId: number
    name: string
    jobTitle: string
    email: string
    department: string
    appraisalStatus: AppraisalStatus
    hasAppraisal?: boolean
}

const STATUS_STYLES: Record<AppraisalStatus, { label: string; className: string }> = {
    PENDING: { label: 'Pending', className: 'bg-gray-100 text-gray-500' },
    EMPLOYEE_DRAFT: { label: 'Draft', className: 'bg-yellow-50 text-yellow-600' },
    SELF_SUBMITTED: { label: 'Self Submitted', className: 'bg-blue-50 text-[#1089D3]' },
    MANAGER_DRAFT: { label: 'Draft Saved', className: 'bg-orange-50 text-orange-500' },
    MANAGER_REVIEWED: { label: 'Pending Approval', className: 'bg-purple-50 text-purple-600' },
    APPROVED: { label: 'Approved', className: 'bg-green-50 text-green-600' },
    ACKNOWLEDGED: { label: 'Acknowledged', className: 'bg-green-100 text-green-700' },
}

const ACTIONABLE_STATUSES: AppraisalStatus[] = ['SELF_SUBMITTED']
const NOTHING_TO_VIEW_STATUSES: AppraisalStatus[] = ['PENDING']

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function TeamMemberCard({ employeeId, name, jobTitle, email, department, appraisalStatus, hasAppraisal }: Props) {
    const navigate = useNavigate()

    const style = !hasAppraisal
        ? { label: 'Not Assigned', className: 'bg-gray-100 text-gray-400' }
        : STATUS_STYLES[appraisalStatus]
    const actionable = ACTIONABLE_STATUSES.includes(appraisalStatus)
    const nothingToView = NOTHING_TO_VIEW_STATUSES.includes(appraisalStatus)

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex flex-col gap-2">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#1089D3] to-[#12B1D1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(name)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{name}</p>
                        <p className="text-xs text-gray-400 leading-tight">{jobTitle}</p>
                    </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.className}`}>
                    {style.label}
                </span>
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
                <span>{email}</span>
                <span>·</span>
                <span>{department}</span>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => navigate(`/manager/review/${employeeId}`)}
                    disabled={nothingToView}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${nothingToView
                            ? 'border border-gray-200 text-gray-300 cursor-not-allowed'
                            : actionable
                                ? 'bg-[#1089D3] text-white hover:bg-[#0e7abf]'
                                : 'border border-gray-200 text-gray-600 hover:border-[#1089D3] hover:text-[#1089D3]'
                        }`}
                >
                    {actionable ? 'Review' : 'View Appraisal'}
                </button>
                <button
                    onClick={() => navigate(`/manager/goals?employeeId=${employeeId}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#1089D3] hover:text-[#1089D3] transition-all"
                >
                    View Goals
                </button>
            </div>

        </div>
    )
}