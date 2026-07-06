import { useState } from 'react'
import type { GoalStatus } from '../../types'

interface Props {
    goalTitle: string
    currentStatus: GoalStatus
    currentNote: string
    onClose: () => void
    onUpdate: (newStatus: GoalStatus, note: string) => void
}

// Employee can only move forward — not backwards
const ALLOWED_TRANSITIONS: Record<GoalStatus, GoalStatus[]> = {
    NOT_STARTED:        ['IN_PROGRESS'],
    IN_PROGRESS:        ['EMPLOYEE_SUBMITTED'],
    EMPLOYEE_SUBMITTED: [],
    COMPLETED:          [],
    NOT_COMPLETED:      [],
    CANCELLED:          [],
}

const STATUS_LABELS: Record<GoalStatus, string> = {
    NOT_STARTED:        'Not Started',
    IN_PROGRESS:        'In Progress',
    EMPLOYEE_SUBMITTED: 'Submit for Review',
    COMPLETED:          'Completed',
    NOT_COMPLETED:      'Not Completed',
    CANCELLED:          'Cancelled',
}

export default function UpdateGoalModal({ goalTitle, currentStatus, currentNote, onClose, onUpdate }: Props) {
    const [selectedStatus, setSelectedStatus] = useState<GoalStatus>(currentStatus)
    const [note, setNote] = useState(currentNote)

    const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus]

    function handleUpdate() {
        onUpdate(selectedStatus, note)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Update Goal</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {/* Goal title */}
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Goal</p>
                    <p className="text-sm text-gray-700 font-medium">{goalTitle}</p>
                </div>

                {/* Current status */}
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Current Status</p>
                    <span className="text-xs font-semibold text-[#1089D3]">{STATUS_LABELS[currentStatus]}</span>
                </div>

                {/* New status selection */}
                {allowedStatuses.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Update Status To</p>
                        <div className="flex flex-col gap-2">
                            {/* Keep current */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value={currentStatus}
                                    checked={selectedStatus === currentStatus}
                                    onChange={() => setSelectedStatus(currentStatus)}
                                    className="accent-[#1089D3]"
                                />
                                <span className="text-sm text-gray-600">Keep as {STATUS_LABELS[currentStatus]}</span>
                            </label>
                            {/* Allowed transitions */}
                            {allowedStatuses.map(s => (
                                <label key={s} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={selectedStatus === s}
                                        onChange={() => setSelectedStatus(s)}
                                        className="accent-[#1089D3]"
                                    />
                                    <span className="text-sm text-gray-600">{STATUS_LABELS[s]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Note */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        Note <span className="text-gray-300 normal-case">(optional)</span>
                    </label>
                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        placeholder="Add a note about your progress..."
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#1089D3] focus:ring-1 focus:ring-[#1089D3] transition-all placeholder-gray-300"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                    >
                        Save Update
                    </button>
                </div>

            </div>
        </div>
    )
}