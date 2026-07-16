import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import GoalsStatCards from '../components/goals/GoalsStatCards'
import GoalsFilter from '../components/goals/GoalsFilter'
import GoalsTable from '../components/goals/GoalsTable'
import { getLoggedInUser } from '../utils/auth'
import type { GoalStatus, GoalResponseDTO } from '../types'
import { getGoalsByEmployee, submitGoalCompletion, startGoal, updateEmployeeNote } from '../api/goalApi'

export default function Goals() {
    const { name, initials, department, role, userId } = getLoggedInUser()

    const [activeFilter, setActiveFilter] = useState<GoalStatus | 'ALL'>('ALL')
    const [goals, setGoals] = useState<GoalResponseDTO[]>([])
    const [loading, setLoading] = useState(true)

    const filteredGoals = activeFilter === 'ALL'
        ? goals
        : goals.filter(g => g.status === activeFilter)

    const total      = goals.length
    const completed  = goals.filter(g => g.status === 'COMPLETED').length
    const inProgress = goals.filter(g => g.status === 'IN_PROGRESS').length
    const notStarted = goals.filter(g => g.status === 'NOT_STARTED').length

    useEffect(() => {
        loadGoals(true)
    }, [])

    async function loadGoals(isInitialLoad = false) {
        if (isInitialLoad) setLoading(true)
        try {
            const data = await getGoalsByEmployee(userId)
            setGoals(data)
        } catch (error) {
            console.error(error)
        } finally {
            if (isInitialLoad) setLoading(false)
        }
    }

    async function handleUpdateStatus(goalId: number, newStatus: GoalStatus, note: string) {
        try {
            const currentGoal = goals.find(g => g.goalId === goalId)

            if (newStatus === 'IN_PROGRESS') {
                if (currentGoal?.status === 'NOT_STARTED') {
                    await startGoal(goalId)
                }
                if (note.trim()) {
                    await updateEmployeeNote(goalId, note)
                }
            } else if (newStatus === 'EMPLOYEE_SUBMITTED') {
                await submitGoalCompletion(goalId, true, note)
            } else {
                if (note.trim()) {
                    await updateEmployeeNote(goalId, note)
                }
            }
            await loadGoals()
        } catch (error) {
            console.error('Failed to update goal:', error)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                name={name}
                initials={initials}
                department={department ?? '—'}
                role={role}
                activePage="My Goals"
            />

            <div className="flex-1 py-4 px-5 flex flex-col gap-6 overflow-auto">
                <Topbar />

                <div className="flex items-center justify-between pb-3 mb-1 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>My Goals</h2>
                        <p className="text-xs text-gray-400 mt-1">
                            {loading ? 'Loading...' : `${total} goals`}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <GoalsStatCards
                            total={total}
                            completed={completed}
                            inProgress={inProgress}
                            notStarted={notStarted}
                        />

                        <GoalsFilter
                            activeFilter={activeFilter}
                            onChange={setActiveFilter}
                        />

                        {goals.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                                <p className="text-sm font-medium text-gray-500">No goals assigned yet</p>
                                <p className="text-xs text-gray-400 mt-1">Your manager will add goals for the current cycle here</p>
                            </div>
                        ) : (
                            <GoalsTable
                                goals={filteredGoals}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        )}
                    </>
                )}

            </div>
        </div>
    )
}