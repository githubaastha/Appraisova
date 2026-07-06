import type { AppraisalStatus } from '../../types'
import AppraisalDetails from './AppraisalDetails'
import SelfAssessmentForm from './SelfAssessmentForm'
import ManagerReviewCard from './ManagerReviewCard'
import AppraisalGoalsList from './AppraisalGoalsList'

interface Goal {
    goalId: number
    title: string
    dueDate: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'EMPLOYEE_SUBMITTED' | 'COMPLETED' | 'NOT_COMPLETED' | 'CANCELLED'
    employeeNote: string | null
}

interface Props {
    appraisalId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    managerName: string
    managerEmail: string
    status: AppraisalStatus
    isClosed: boolean
    whatWentWell: string
    whatToImprove: string
    achievements: string
    selfRating: number | null
    managerStrengths?: string
    managerImprove?: string
    managerComments?: string
    managerRating?: number | null
    approvedAt?: string | null
    goals: Goal[]
    onStatusChange?: (
        status: AppraisalStatus,
        data?: {
            whatWentWell: string
            whatToImprove: string
            achievements: string
            selfRating: number | null
        }
    ) => void
}

export default function AppraisalDetailContent({
    appraisalId,
    cycleName,
    cycleStartDate,
    cycleEndDate,
    managerName,
    managerEmail,
    status,
    isClosed,
    whatWentWell,
    whatToImprove,
    achievements,
    selfRating,
    managerStrengths,
    managerImprove,
    managerComments,
    managerRating,
    approvedAt,
    goals,
    onStatusChange
}: Props) {
    return (
        <div className="flex flex-col gap-5">

            <AppraisalDetails
                cycleName={cycleName}
                cycleStartDate={cycleStartDate}
                cycleEndDate={cycleEndDate}
                managerName={managerName}
                managerEmail={managerEmail}
                status={status}
            />
            <SelfAssessmentForm
                appraisalId={appraisalId}
                status={isClosed ? 'ACKNOWLEDGED' : status}
                initialData={{ whatWentWell, whatToImprove, achievements, selfRating }}
                onStatusChange={onStatusChange}
            />

            <ManagerReviewCard
                appraisalId={appraisalId}
                status={status}
                managerStrengths={managerStrengths}
                managerImprove={managerImprove}
                managerComments={managerComments}
                managerRating={managerRating}
                approvedAt={approvedAt}
                onStatusChange={onStatusChange}
            />

            <AppraisalGoalsList goals={goals} readOnly={isClosed} />

        </div>
    )
}