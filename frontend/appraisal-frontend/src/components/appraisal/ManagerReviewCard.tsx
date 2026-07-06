import { useState } from 'react'
import { acknowledgeAppraisal } from '../../api/appraisalApi'

type AppraisalStatus =
    | 'PENDING'
    | 'EMPLOYEE_DRAFT'
    | 'SELF_SUBMITTED'
    | 'MANAGER_DRAFT'
    | 'MANAGER_REVIEWED'
    | 'APPROVED'
    | 'ACKNOWLEDGED'

interface Props {
    appraisalId: number
    status: AppraisalStatus
    managerStrengths?: string
    managerImprove?: string
    managerComments?: string
    managerRating?: number | null
    approvedAt?: string | null
    onStatusChange?: (status: AppraisalStatus) => void
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function ManagerReviewCard({
    appraisalId,
    status,
    managerStrengths,
    managerImprove,
    managerComments,
    managerRating,
    approvedAt,
    onStatusChange,
}: Props) {
    const isVisible = status === 'APPROVED' || status === 'ACKNOWLEDGED'
    const canAcknowledge = status === 'APPROVED'
    const [acknowledging, setAcknowledging] = useState(false)

    if (!isVisible) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3">
                    Manager Review
                </p>
                <p className="text-sm text-gray-400 bg-gray-50 px-4 py-3 rounded-lg">
                    Manager review will be visible once your appraisal is approved.
                </p>
            </div>
        )
    }

    const handleAcknowledge = async () => {
        if (acknowledging) return
        setAcknowledging(true)
        try {
            await acknowledgeAppraisal(appraisalId)
            onStatusChange?.('ACKNOWLEDGED')
        } catch (err) {
            console.error(err)
            alert('Failed to acknowledge appraisal')
        } finally {
            setAcknowledging(false)
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Manager Review
                </p>
                {approvedAt && (
                    <span className="text-xs text-gray-400">
                        Approved on {formatDate(approvedAt)}
                    </span>
                )}
            </div>

            {/* Manager Rating */}
            {managerRating && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-gray-600">Manager Rating</p>
                    <div className="flex gap-1 items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                            <span
                                key={star}
                                className={`text-2xl ${star <= managerRating ? 'text-[#1089D3]' : 'text-gray-200'}`}
                            >
                                ★
                            </span>
                        ))}
                        <span className="text-xs text-gray-400 ml-2">{managerRating} out of 5</span>
                    </div>
                </div>
            )}

            {/* Manager Strengths */}
            {managerStrengths && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-gray-600">Strengths</p>
                    <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                        {managerStrengths}
                    </p>
                </div>
            )}

            {/* Manager Improve */}
            {managerImprove && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-gray-600">Areas to Improve</p>
                    <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                        {managerImprove}
                    </p>
                </div>
            )}

            {/* Manager Comments */}
            {managerComments && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-gray-600">Comments</p>
                    <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                        {managerComments}
                    </p>
                </div>
            )}

            {/* Acknowledge Button */}
            {canAcknowledge && (
                <div className="pt-2">
                    <button
                        onClick={handleAcknowledge}
                        disabled={acknowledging}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium border-2 border-green-500 text-green-600 bg-white hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {acknowledging ? 'Acknowledging...' : 'Acknowledge Appraisal'}
                    </button>
                </div>
            )}

            {status === 'ACKNOWLEDGED' && (
                <p className="text-xs text-green-600 bg-green-50 px-4 py-3 rounded-lg font-medium">
                    ✓ You have acknowledged this appraisal. Cycle is complete.
                </p>
            )}

        </div>
    )
}