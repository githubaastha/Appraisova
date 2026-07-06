import { useState, useEffect } from 'react'
import type { GoalStatus } from '../../types'
import { startGoal, submitGoalCompletion, updateEmployeeNote } from '../../api/goalApi'

interface Goal {
    goalId: number
    title: string
    dueDate: string
    status: GoalStatus
    employeeNote: string | null
}

interface Props {
    goals: Goal[]
    readOnly: boolean
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

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function AppraisalGoalsList({ goals: initialGoals, readOnly }: Props) {
    const [goals, setGoals] = useState<Goal[]>(initialGoals)
    const [updatingGoalId, setUpdatingGoalId] = useState<number | null>(null)
    const [noteGoalId, setNoteGoalId] = useState<number | null>(null)
    const [noteText, setNoteText] = useState('')
    const [savingGoalId, setSavingGoalId] = useState<number | null>(null)

    useEffect(() => {
        setGoals(initialGoals)
    }, [initialGoals])

    if (goals.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3">
                    Goals
                </p>
                <p className="text-sm text-gray-400 text-center py-4">No goals assigned for this cycle</p>
            </div>
        )
    }

    const handleUpdateStatus = async (goalId: number, newStatus: GoalStatus) => {
        if (savingGoalId) return
        setSavingGoalId(goalId)
        try {
            const goal = goals.find(g => g.goalId === goalId)

            if (newStatus === 'IN_PROGRESS') {
                if (goal?.status === 'NOT_STARTED') {
                    await startGoal(goalId)
                }
            } else if (newStatus === 'EMPLOYEE_SUBMITTED') {
                await submitGoalCompletion(goalId, true, goal?.employeeNote || '')
            }

            setGoals(prev => prev.map(g => g.goalId === goalId ? { ...g, status: newStatus } : g))
            setUpdatingGoalId(null)
        } catch (err) {
            console.error(err)
            alert('Failed to update goal status')
        } finally {
            setSavingGoalId(null)
        }
    }

    const handleSaveNote = async (goalId: number) => {
        if (savingGoalId) return
        setSavingGoalId(goalId)
        try {
            await updateEmployeeNote(goalId, noteText)
            setGoals(prev => prev.map(g => g.goalId === goalId ? { ...g, employeeNote: noteText } : g))
            setNoteGoalId(null)
            setNoteText('')
        } catch (err) {
            console.error(err)
            alert('Failed to save note')
        } finally {
            setSavingGoalId(null)
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-4">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Goals for this Cycle
            </p>

            <div className="flex flex-col gap-3">
                {goals.map(goal => {
                    const style = STATUS_STYLES[goal.status]
                    const disabled = DISABLED_STATUSES.includes(goal.status)
                    const isEditingNote = noteGoalId === goal.goalId
                    const isUpdatingThis = updatingGoalId === goal.goalId
                    const isSavingThis = savingGoalId === goal.goalId

                    return (
                        <div key={goal.goalId} className="border border-gray-100 rounded-lg px-4 py-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-gray-700">{goal.title}</p>
                                    <p className="text-xs text-gray-400">Due {formatDate(goal.dueDate)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${style.className}`}>
                                        {style.label}
                                    </span>
                                    {!readOnly && (
                                        <>
                                            <button
                                                disabled={disabled}
                                                onClick={() => setUpdatingGoalId(isUpdatingThis ? null : goal.goalId)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                    ${disabled
                                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                        : 'border border-[#1089D3] text-[#1089D3] hover:bg-blue-50'
                                                    }`}
                                            >
                                                Update
                                            </button>
                                            {!disabled && (
                                                <button
                                                    onClick={() => {
                                                        setNoteGoalId(goal.goalId)
                                                        setNoteText(goal.employeeNote || '')
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#1089D3] hover:text-[#1089D3] transition-all"
                                                >
                                                    {goal.employeeNote ? 'Edit Note' : 'Add Note'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Update status options */}
                            {isUpdatingThis && (
                                <div className="flex gap-2 flex-wrap pt-1">
                                    {(['NOT_STARTED', 'IN_PROGRESS', 'EMPLOYEE_SUBMITTED'] as GoalStatus[]).map(s => (
                                        <button
                                            key={s}
                                            disabled={isSavingThis}
                                            onClick={() => handleUpdateStatus(goal.goalId, s)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50
                                                ${goal.status === s
                                                    ? 'bg-[#1089D3] border-[#1089D3] text-white'
                                                    : 'border-gray-200 text-gray-500 hover:border-[#1089D3] hover:text-[#1089D3]'
                                                }`}
                                        >
                                            {isSavingThis ? 'Saving...' : STATUS_STYLES[s].label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Existing note display */}
                            {!isEditingNote && goal.employeeNote && (
                                <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                    {goal.employeeNote}
                                </p>
                            )}

                            {/* Note edit box */}
                            {isEditingNote && (
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        rows={2}
                                        placeholder="Add a note about this goal..."
                                        className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1089D3]"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveNote(goal.goalId)}
                                            disabled={savingGoalId === goal.goalId}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] disabled:opacity-50"
                                        >
                                            {savingGoalId === goal.goalId ? 'Saving...' : 'Save Note'}
                                        </button>
                                        <button
                                            onClick={() => { setNoteGoalId(null); setNoteText('') }}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}