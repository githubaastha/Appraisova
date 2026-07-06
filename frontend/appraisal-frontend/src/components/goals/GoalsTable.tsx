import { useState } from 'react'

import UpdateGoalModal from './UpdateGoalModal'
import type { GoalStatus, GoalResponseDTO } from '../../types'


interface Props {
    goals: GoalResponseDTO[]
    onUpdateStatus: (
        goalId: number,
        newStatus: GoalStatus,
        note: string
    ) => Promise<void>
}

const STATUS_STYLES: Record<GoalStatus, { label: string; className: string }> = {
    NOT_STARTED: { label: 'Not Started', className: 'bg-gray-100 text-gray-500' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-[#1089D3]' },
    EMPLOYEE_SUBMITTED: { label: 'Submitted', className: 'bg-cyan-50 text-cyan-600' },
    COMPLETED: { label: 'Completed', className: 'bg-green-50 text-green-600' },
    NOT_COMPLETED: { label: 'Not Completed', className: 'bg-red-50 text-red-500' },
    CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-400' },
}

const DISABLED_STATUSES: GoalStatus[] = ['COMPLETED', 'NOT_COMPLETED', 'EMPLOYEE_SUBMITTED', 'CANCELLED']
const HIDE_DAYS_STATUSES: GoalStatus[] = ['COMPLETED', 'NOT_COMPLETED', 'CANCELLED', 'EMPLOYEE_SUBMITTED']

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function GoalsTable({ goals, onUpdateStatus }: Props) {
    const [updatingGoal, setUpdatingGoal] = useState<GoalResponseDTO | null>(null)

    if (goals.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No goals found</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {updatingGoal && (
                <UpdateGoalModal
                    goalTitle={updatingGoal.title}
                    currentStatus={updatingGoal.status}
                    currentNote={updatingGoal.employeeNote ?? ''}
                    onClose={() => setUpdatingGoal(null)}
                    onUpdate={async (newStatus, note) => {
                        await onUpdateStatus(
                            updatingGoal.goalId,
                            newStatus,
                            note
                        )
                        setUpdatingGoal(null)
                    }}
                />
            )}

            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Goal</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Appraisal</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Due Date</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Days Left</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {goals.map(goal => {
                        const daysLeft = daysUntil(goal.dueDate)
                        const style = STATUS_STYLES[goal.status]
                        const disabled = DISABLED_STATUSES.includes(goal.status)
                        const hideDays = HIDE_DAYS_STATUSES.includes(goal.status)

                        return (
                            <tr key={goal.goalId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm text-gray-700 font-medium">{goal.title}</span>
                                        {goal.employeeNote && (
                                            <span className="text-[10px] text-gray-400 italic max-w-xs">"{goal.employeeNote}"</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {goal.cycleName}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">{formatDate(goal.dueDate)}</td>
                                <td className="px-6 py-4">
                                    {hideDays
                                        ? <span className="text-xs text-gray-300">—</span>
                                        : <span className={`text-xs font-semibold ${daysLeft <= 7 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {daysLeft} days
                                        </span>
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${style.className}`}>
                                        {style.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        disabled={disabled}
                                        onClick={() => !disabled && setUpdatingGoal(goal)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                            ${disabled
                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                : 'border border-[#1089D3] text-[#1089D3] hover:bg-blue-50'
                                            }`}
                                    >
                                        Update
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}