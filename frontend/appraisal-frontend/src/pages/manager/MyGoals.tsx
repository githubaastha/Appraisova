import { useState, useEffect } from 'react'
import ManagerSidebar from '../../components/ManagerSidebar'
import GoalsStatCards from '../../components/goals/GoalsStatCards'
import GoalsFilter from '../../components/goals/GoalsFilter'
import GoalsTable from '../../components/goals/GoalsTable'
import type { GoalStatus, GoalResponseDTO } from '../../types'
import { getLoggedInUser } from '../../utils/auth'
import { getGoalsByEmployee, submitGoalCompletion } from '../../api/goalApi'
import Topbar from '@/components/Topbar'

export default function MyGoals() {
    const { name, initials, role, managerId, userId } = getLoggedInUser()

    const [activeFilter, setActiveFilter] = useState<GoalStatus | 'ALL'>('ALL')
    const [goals, setGoals] = useState<GoalResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                setLoading(true)
                setError(null)

                const data = await getGoalsByEmployee(userId)
                setGoals(data)

            } catch (err) {
                console.error(err)
                setError('Failed to load goals')
            } finally {
                setLoading(false)
            }
        }

        if (userId) fetchGoals()
    }, [userId])

    const filteredGoals = activeFilter === 'ALL'
        ? goals
        : goals.filter(g => g.status === activeFilter)

    const total = goals.length
    const completed = goals.filter(g => g.status === 'COMPLETED').length
    const inProgress = goals.filter(g => g.status === 'IN_PROGRESS').length
    const notStarted = goals.filter(g => g.status === 'NOT_STARTED').length

    async function handleUpdateStatus(goalId: number, newStatus: GoalStatus, note: string) {
        try {
            await submitGoalCompletion(goalId, newStatus === 'EMPLOYEE_SUBMITTED', note)

            const updated = await getGoalsByEmployee(userId)
            setGoals(updated)

        } catch (err) {
            console.error(err)
            setError('Failed to update goal status')
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <ManagerSidebar
                    name={name}
                    initials={initials}
                    role={role}
                    activePage="My Goals"
                    hasManager={!!managerId}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <ManagerSidebar
                    name={name}
                    initials={initials}
                    role={role}
                    activePage="My Goals"
                    hasManager={!!managerId}
                />
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="My Goals"
                hasManager={!!managerId}
            />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar />

                <div className="flex items-center justify-between pb-3 mb-1 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>My Goals</h2>
                        <p className="text-xs text-gray-400 mt-1">{total} goals across all cycles</p>
                    </div>
                </div>

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
                        <p className="text-xs text-gray-400 mt-1">Goals will show up here once they're assigned to you</p>
                    </div>
                ) : (
                    <GoalsTable
                        goals={filteredGoals}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}

            </div>
        </div>
    )
}