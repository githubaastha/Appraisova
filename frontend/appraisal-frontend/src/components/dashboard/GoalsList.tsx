import { useNavigate } from 'react-router-dom'
import type { GoalStatus } from '../../types'

interface Goal {
    goalId: number
    title: string
    dueDate: string
    status: GoalStatus
}

interface Props {
    goals: Goal[]
}

const STATUS_STYLES: Record<GoalStatus, { label: string; className: string }> = {
    NOT_STARTED: { label: 'Not Started', className: 'bg-gray-100 text-gray-500' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-[#1089D3]' },
    EMPLOYEE_SUBMITTED: { label: 'Submitted', className: 'bg-cyan-50 text-cyan-600' },
    COMPLETED: { label: 'Completed', className: 'bg-green-50 text-green-600' },
    NOT_COMPLETED: { label: 'Not Completed', className: 'bg-red-50 text-red-500' },
    CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-400 line-through' },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function GoalsList({ goals }: Props) {
    const navigate = useNavigate()

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">My Goals</p>
                <button
                    onClick={() => navigate('/goals')}
                    className="text-xs text-[#1089D3] font-medium hover:underline"
                >
                    View All
                </button>
            </div>

            {goals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No active goals right now</p>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider pb-3 w-1/5">Goal</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider pb-3 w-1/6">Due Date</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider pb-3 w-1/6">Days Left</th>
                            <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider pb-3 w-1/6">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goals.map((goal) => {
                            const daysLeft = daysUntil(goal.dueDate)
                            const style = STATUS_STYLES[goal.status]
                            return (
                                <tr key={goal.goalId} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                    <td className="py-3 text-sm text-gray-700 font-medium">{goal.title}</td>
                                    <td className="py-3 text-xs text-gray-400">{formatDate(goal.dueDate)}</td>
                                    <td className="py-3">
                                        <span className={`text-xs font-semibold ${daysLeft <= 7 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {daysLeft} days
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${style.className}`}>
                                            {style.label}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}