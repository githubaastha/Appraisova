import { useState } from 'react'
import type { GoalStatus } from '../../../types'
import ReviewGoalModal from './ReviewGoalModal'

interface Goal {
    goalId: number
    employeeId: number
    employeeName: string
    cycleName?: string
    title: string
    dueDate: string
    status: GoalStatus
}

interface Props {
    goals: Goal[]
    onUpdateStatus: (goalId: number, newStatus: GoalStatus) => void
    onCancelGoal: (goalId: number) => void
}

const STATUS_STYLES: Record<GoalStatus, { label: string; className: string }> = {
    NOT_STARTED:        { label: 'Not Started',   className: 'bg-gray-100 text-gray-500' },
    IN_PROGRESS:        { label: 'In Progress',   className: 'bg-blue-50 text-[#1089D3]' },
    EMPLOYEE_SUBMITTED: { label: 'Submitted',     className: 'bg-cyan-50 text-cyan-600' },
    COMPLETED:          { label: 'Completed',     className: 'bg-green-50 text-green-600' },
    NOT_COMPLETED:      { label: 'Not Completed', className: 'bg-red-50 text-red-500' },
    CANCELLED:          { label: 'Cancelled',     className: 'bg-gray-100 text-gray-400' },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function TeamGoalsTable({ goals, onUpdateStatus, onCancelGoal }: Props) {
    const [reviewingGoal, setReviewingGoal] = useState<Goal | null>(null)
    const [cancellingGoalId, setCancellingGoalId] = useState<number | null>(null)

    if (goals.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No goals found</p>
            </div>
        )
    }

    const handleConfirm = (status: 'COMPLETED' | 'NOT_COMPLETED') => {
        if (reviewingGoal) {
            onUpdateStatus(reviewingGoal.goalId, status)
            setReviewingGoal(null)
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {reviewingGoal && (
                <ReviewGoalModal
                    goalTitle={reviewingGoal.title}
                    onClose={() => setReviewingGoal(null)}
                    onConfirm={handleConfirm}
                />
            )}

            {/* Cancel confirmation */}
            {cancellingGoalId && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm flex flex-col gap-4 shadow-lg">
                        <p className="text-sm font-semibold text-gray-800">Cancel Goal</p>
                        <p className="text-xs text-gray-500">Are you sure you want to cancel this goal? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancellingGoalId(null)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Keep Goal
                            </button>
                            <button
                                onClick={() => {
                                    onCancelGoal(cancellingGoalId)
                                    setCancellingGoalId(null)
                                }}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
                            >
                                Cancel Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Employee</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Goal</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Due Date</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {goals.map(goal => {
                        const style = STATUS_STYLES[goal.status]
                        return (
                            <tr key={goal.goalId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all">

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                            {getInitials(goal.employeeName)}
                                        </div>
                                        <span className="text-sm text-gray-700">{goal.employeeName}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{goal.title}</td>
                                <td className="px-6 py-4 text-xs text-gray-400">{formatDate(goal.dueDate)}</td>

                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${style.className}`}>
                                        {style.label}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {goal.status === 'EMPLOYEE_SUBMITTED' && (
                                            <button
                                                onClick={() => setReviewingGoal(goal)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                                            >
                                                Review
                                            </button>
                                        )}
                                        {goal.status === 'COMPLETED' && (
                                            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Completed
                                            </span>
                                        )}
                                        {goal.status === 'NOT_COMPLETED' && (
                                            <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Not Completed
                                            </span>
                                        )}
                                        {goal.status === 'CANCELLED' && (
                                            <span className="text-xs text-gray-400">Cancelled</span>
                                        )}
                                        {(goal.status === 'NOT_STARTED' || goal.status === 'IN_PROGRESS') && (
                                            <button
                                                onClick={() => setCancellingGoalId(goal.goalId)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
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