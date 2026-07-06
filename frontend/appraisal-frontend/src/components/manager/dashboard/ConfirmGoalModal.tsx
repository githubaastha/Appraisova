import { confirmGoalCompletion } from '../../../api/goalApi'
import type { GoalStatus } from '../../../types'

interface Props {
    goalId: number
    goalTitle: string
    employeeName: string
    onClose: () => void
    onConfirmed: () => void
}

export default function ConfirmGoalModal({ goalId, goalTitle, employeeName, onClose, onConfirmed }: Props) {

    async function handleConfirm(status: 'COMPLETED' | 'NOT_COMPLETED') {
        try {
            await confirmGoalCompletion(goalId, status as GoalStatus)
            onConfirmed()
            onClose()
        } catch (err) {
            console.error(err)
            alert('Failed to confirm goal')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Confirm Goal Completion</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Goal</p>
                    <p className="text-sm font-medium text-gray-700">{goalTitle}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted by {employeeName}</p>
                </div>

                <p className="text-xs text-gray-500 bg-gray-50 px-4 py-3 rounded-lg">
                    The employee has marked this goal as complete. Please confirm whether it was completed or not.
                </p>

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={() => handleConfirm('NOT_COMPLETED')}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                    >
                        Not Completed
                    </button>
                    <button
                        onClick={() => handleConfirm('COMPLETED')}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
                    >
                        Mark Completed
                    </button>
                </div>

            </div>
        </div>
    )
}