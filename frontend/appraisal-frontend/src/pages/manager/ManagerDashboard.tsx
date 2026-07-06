import { useState, useEffect } from 'react'
import ManagerSidebar from '../../components/ManagerSidebar'
import ManagerStatCards from '../../components/manager/dashboard/ManagerStatCards'
import MyAppraisalsSection from '../../components/manager/dashboard/MyAppraisalsSection'
import ActionRequired from '../../components/manager/dashboard/ActionRequired'
import ConfirmGoalModal from '../../components/manager/dashboard/ConfirmGoalModal'
import Topbar from '@/components/Topbar'

import { getLoggedInUser } from '../../utils/auth'
import { getAppraisalsByEmployee, getAppraisalsByManager } from '../../api/appraisalApi'
import { getGoalsByManager } from '../../api/goalApi'
import { getUsersByManager } from '../../api/usersApi'

import type { AppraisalsByEmployeeDTO, AppraisalsByManagerDTO, GoalResponseDTO, UserResponseDTO } from '../../types'

function todayLabel(): string {
    return new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

export default function ManagerDashboard() {
    const { name, initials, role, managerId, userId } = getLoggedInUser()

    const [myAppraisals, setMyAppraisals] = useState<AppraisalsByEmployeeDTO[]>([])
    const [teamAppraisals, setTeamAppraisals] = useState<AppraisalsByManagerDTO[]>([])
    const [teamGoals, setTeamGoals] = useState<GoalResponseDTO[]>([])
    const [employees, setEmployees] = useState<UserResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [confirmingGoal, setConfirmingGoal] = useState<GoalResponseDTO | null>(null)

    useEffect(() => { loadData() }, [])

    async function loadData(isInitialLoad = true) {
        try {
            if (isInitialLoad) setLoading(true)
            setError('')
            const [myAppraisalData, teamAppraisalData, goalData, employeeData] = await Promise.all([
                managerId ? getAppraisalsByEmployee(userId) : Promise.resolve([]),
                getAppraisalsByManager(userId),
                getGoalsByManager(userId),
                getUsersByManager(userId)
            ])
            setMyAppraisals(myAppraisalData)
            setTeamAppraisals(teamAppraisalData)
            setTeamGoals(goalData)
            setEmployees(employeeData)
        } catch (err) {
            console.error(err)
            setError('Failed to load dashboard data.')
        } finally {
            if (isInitialLoad) setLoading(false)
        }
    }

    const teamSize = employees.length
    const activeReviews = teamAppraisals.filter(a => a.appraisalStatus !== 'ACKNOWLEDGED' && a.appraisalStatus !== 'APPROVED').length
    const awaitingReview = teamAppraisals.filter(a => a.appraisalStatus === 'SELF_SUBMITTED').length
    const completed = teamAppraisals.filter(a => a.appraisalStatus === 'ACKNOWLEDGED' || a.appraisalStatus === 'APPROVED').length

    const myActiveAppraisals = myAppraisals
        .filter(a => a.appraisalStatus !== 'ACKNOWLEDGED' && a.appraisalStatus !== 'APPROVED')
        .map(a => ({
            appraisalId: a.appraisalId,
            cycleName: a.cycleName,
            cycleStartDate: a.cycleStartDate,
            cycleEndDate: a.cycleEndDate,
            managerName: a.managerName,
            status: a.appraisalStatus
        }))

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="Dashboard"
                hasManager={!!managerId}
            />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar />

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <p className="text-sm text-red-500">{error}</p>
                        <button
                            onClick={() => loadData()}
                            className="text-xs text-[#1089D3] font-medium hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Welcome, {name}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{role}</p>
                            </div>
                            <p className="text-xs text-gray-400">{todayLabel()}</p>
                        </div>

                        <ManagerStatCards
                            teamSize={teamSize}
                            activeReviews={activeReviews}
                            awaitingReview={awaitingReview}
                            completed={completed}
                        />

                        {managerId && (
                            <MyAppraisalsSection appraisals={myActiveAppraisals} />
                        )}

                        {confirmingGoal && (
                            <ConfirmGoalModal
                                goalId={confirmingGoal.goalId}
                                goalTitle={confirmingGoal.title}
                                employeeName={confirmingGoal.employeeName}
                                onClose={() => setConfirmingGoal(null)}
                                onConfirmed={() => loadData(false)}
                            />
                        )}

                        <ActionRequired
                            appraisals={teamAppraisals}
                            goals={teamGoals}
                            onConfirmGoal={(goal) => setConfirmingGoal(goal)}
                        />
                    </>
                )}
            </div>
        </div>
    )
}