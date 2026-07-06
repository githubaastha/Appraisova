import { useNavigate } from 'react-router-dom'
import type { AppraisalStatus } from '../../../types'

interface Appraisal {
    appraisalId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    managerName: string
    status: AppraisalStatus
}

interface Props {
    appraisals: Appraisal[]
}

const STATUS_STYLES: Record<AppraisalStatus, { label: string; className: string }> = {
    PENDING:          { label: 'Pending',          className: 'bg-gray-100 text-gray-500' },
    EMPLOYEE_DRAFT:   { label: 'Draft',            className: 'bg-yellow-50 text-yellow-600' },
    SELF_SUBMITTED:   { label: 'Self Submitted',   className: 'bg-blue-50 text-[#1089D3]' },
    MANAGER_DRAFT:    { label: 'Manager Draft',    className: 'bg-orange-50 text-orange-500' },
    MANAGER_REVIEWED: { label: 'Manager Reviewed', className: 'bg-purple-50 text-purple-600' },
    APPROVED:         { label: 'Approved',         className: 'bg-green-50 text-green-600' },
    ACKNOWLEDGED:     { label: 'Acknowledged',      className: 'bg-green-100 text-green-700' },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function MyAppraisalsSection({ appraisals }: Props) {
    const navigate = useNavigate()

    const canFillAssessment = (status: AppraisalStatus) =>
        status === 'PENDING' || status === 'EMPLOYEE_DRAFT'

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        My Appraisals
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5">As an employee reporting to the manager</p>
                </div>
                <button
                    onClick={() => navigate('/manager/my-appraisals')}
                    className="text-xs text-[#1089D3] font-medium hover:underline"
                >
                    View All
                </button>
            </div>

            {appraisals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No appraisals found</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {appraisals.slice(0, 2).map(appraisal => {
                        const style = STATUS_STYLES[appraisal.status]
                        return (
                            <div
                                key={appraisal.appraisalId}
                                className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">{appraisal.cycleName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Reviewed by {appraisal.managerName} · {formatDate(appraisal.cycleStartDate)} — {formatDate(appraisal.cycleEndDate)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${style.className}`}>
                                        {style.label}
                                    </span>
                                    {canFillAssessment(appraisal.status) && (
                                        <button
                                            onClick={() => navigate(`/manager/my-appraisals/${appraisal.appraisalId}`)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                                        >
                                            Fill Self Assessment
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}