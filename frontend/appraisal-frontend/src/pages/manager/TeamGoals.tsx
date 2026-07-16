import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import ManagerSidebar from '../../components/ManagerSidebar'
import TeamGoalsFilters from '../../components/manager/teamgoals/TeamGoalsFilters'
import TeamGoalsTable from '../../components/manager/teamgoals/TeamGoalsTable'
import AssignGoalModal from '../../components/manager/teamgoals/AssignGoalModal'

import { getLoggedInUser } from '../../utils/auth'

import type {
    GoalStatus,
    GoalResponseDTO,
    UserResponseDTO,
} from '../../types'

import {
    getGoalsByManager,
    createGoal,
    confirmGoalCompletion,
    cancelGoal
} from '../../api/goalApi'

import { getUsersByManager } from '../../api/usersApi'
import {
    getAppraisalsByEmployee,
    getAppraisalsByManager
} from '../../api/appraisalApi'
import Topbar from '../../components/Topbar'

export default function TeamGoals() {

    const { name, initials, role, managerId, userId } = getLoggedInUser()

    const [searchParams] = useSearchParams()
    const employeeIdParam = searchParams.get('employeeId')

    const [goals, setGoals] = useState<GoalResponseDTO[]>([])
    const [employees, setEmployees] = useState<UserResponseDTO[]>([])
    const [cycles, setCycles] = useState<string[]>([])

    const [activeEmployee, setActiveEmployee] = useState<number | 'ALL'>(
        employeeIdParam ? Number(employeeIdParam) : 'ALL'
    )

    const [activeStatus, setActiveStatus] = useState<GoalStatus | 'ALL'>('ALL')
    const [activeCycle, setActiveCycle] = useState<string>('')
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [assignMessage, setAssignMessage] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
        loadData(true)
    }, [])

    async function loadData(isInitialLoad = false) {
        try {
            if (isInitialLoad) setLoading(true);

            const [goalData, employeeData, appraisalResponse] = await Promise.all([
                getGoalsByManager(userId),
                getUsersByManager(userId),
                getAppraisalsByManager(userId, 0, 1000)
            ]);

            const appraisalData = appraisalResponse.content;

            setGoals(goalData);
            setEmployees(employeeData);

            const uniqueCycles = Array.from(new Set(appraisalData.map(a => a.cycleName)));
            setCycles(uniqueCycles);
            setActiveCycle(prev => prev || uniqueCycles[0] || '');

        } catch (error) {
            console.error(error);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }

    const employeeOptions = useMemo(() => {
        return employees.map(e => ({
            employeeId: e.userId,
            name: `${e.firstName} ${e.lastName}`
        }))
    }, [employees])

    const filteredGoals = useMemo(() => {
        return goals.filter(goal => {
            if (activeCycle && goal.cycleName !== activeCycle) return false
            if (activeEmployee !== 'ALL' && goal.employeeId !== activeEmployee) return false
            if (activeStatus !== 'ALL' && goal.status !== activeStatus) return false
            return true
        })
    }, [goals, activeCycle, activeEmployee, activeStatus])

    async function handleAssignGoal(data: {
        employeeId: number | 'ALL'
        title: string
        description: string
        dueDate: string
        cycleName: string
    }) {
        try {
            setAssigning(true)
            const targets = data.employeeId === 'ALL'
                ? employeeOptions.map(e => e.employeeId)
                : [data.employeeId]

            const skipped: string[] = []

            for (const empId of targets) {
                try {
                    const empAppraisals = await getAppraisalsByEmployee(empId)
                    const appraisal = empAppraisals.find(a => a.cycleName === data.cycleName)

                    if (!appraisal) {
                        const emp = employeeOptions.find(e => e.employeeId === empId)
                        skipped.push(emp?.name ?? `Employee ${empId}`)
                        continue
                    }

                    await createGoal({
                        appraisalId: appraisal.appraisalId,
                        employeeId: empId,
                        title: data.title,
                        description: data.description,
                        dueDate: data.dueDate
                    })
                } catch (err) {
                    console.error(`Failed for employee ${empId}:`, err)
                    const emp = employeeOptions.find(e => e.employeeId === empId)
                    skipped.push(emp?.name ?? `Employee ${empId}`)
                }
            }

            setShowModal(false)
            await loadData()

            if (skipped.length > 0) {
                setAssignMessage(`Goals created. Skipped: ${skipped.join(', ')} — no appraisal in cycle ${data.cycleName}`)
                setTimeout(() => setAssignMessage(null), 4000)
            }

        } catch (err) {
            console.error(err)
            setActionError('Failed to assign goal. Please try again.')
            setTimeout(() => setActionError(null), 4000)
        } finally {
            setAssigning(false)
        }
    }


    return (
        <div className="flex min-h-screen bg-gray-50">
            {assignMessage && (
                <div className="fixed top-6 right-6 z-50 bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-lg flex items-start gap-3 max-w-sm">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-gray-800">Goals Assigned</p>
                        <p className="text-xs text-gray-500">{assignMessage}</p>
                    </div>
                    <button onClick={() => setAssignMessage(null)} className="text-gray-400 hover:text-gray-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {actionError && (
                <div className="fixed top-6 right-6 z-50 bg-white border border-red-200 rounded-xl px-5 py-4 shadow-lg flex items-start gap-3 max-w-sm">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-red-600">Action Failed</p>
                        <p className="text-xs text-gray-500">{actionError}</p>
                    </div>
                    <button onClick={() => setActionError(null)} className="text-gray-400 hover:text-gray-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <ManagerSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="Team Goals"
                hasManager={!!managerId}
            />

            {showModal && (
                <AssignGoalModal
                    employees={employeeOptions}
                    cycleName={activeCycle}
                    cycles={cycles}
                    assigning={assigning}
                    onClose={() => setShowModal(false)}
                    onAssign={handleAssignGoal}
                />
            )}

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar />

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold " style={{ color: '#111827' }}>Team Goals</h2>
                        <p className="text-xs text-gray-400">{activeCycle}</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white"
                    >
                        + Assign Goal
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <TeamGoalsFilters
                            employees={employeeOptions}
                            cycles={cycles}
                            activeEmployee={activeEmployee}
                            activeStatus={activeStatus}
                            activeCycle={activeCycle}
                            onEmployeeChange={setActiveEmployee}
                            onStatusChange={setActiveStatus}
                            onCycleChange={setActiveCycle}
                        />

                        {filteredGoals.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                                <p className="text-sm font-medium text-gray-500">No goals found</p>
                                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters, or assign a new goal</p>
                            </div>
                        ) : (
                            <TeamGoalsTable
                                goals={filteredGoals}
                                onUpdateStatus={async (goalId, newStatus) => {
                                    await confirmGoalCompletion(goalId, newStatus)
                                    await loadData()
                                }}
                                onCancelGoal={async (goalId) => {
                                    await cancelGoal(goalId)
                                    await loadData()
                                }}
                            />
                        )}
                    </>
                )}

            </div>
        </div>
    )
}