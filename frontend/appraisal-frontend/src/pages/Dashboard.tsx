import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import GoalsList from '../components/dashboard/GoalsList'
import GoalsPieChart from '../components/dashboard/GoalsPieChart'
import Topbar from '../components/Topbar'
import { getLoggedInUser } from '../utils/auth'
import { getAppraisalsByEmployee } from '../api/appraisalApi'
import { getGoalsByEmployee } from '../api/goalApi'
import type { AppraisalsByEmployeeDTO, GoalResponseDTO } from '../types'

function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function Dashboard() {
    const { name, initials, department, role, userId } = getLoggedInUser()

    const [appraisals, setAppraisals] = useState<AppraisalsByEmployeeDTO[]>([])
    const [goals, setGoals] = useState<GoalResponseDTO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        Promise.all([
            getAppraisalsByEmployee(userId),
            getGoalsByEmployee(userId)
        ]).then(([appraisalData, goalData]) => {
            setAppraisals(appraisalData)
            setGoals(goalData)
        }).finally(() => setLoading(false))
    }, [])

    // pick active appraisal
    const currentAppraisal = appraisals.find(a => a.cycleStatus === 'ACTIVE') ?? appraisals[0]

    const daysLeft = currentAppraisal ? daysUntil(currentAppraisal.cycleEndDate) : 0

    const total      = goals.length
    const completed  = goals.filter(g => g.status === 'COMPLETED').length
    const inProgress = goals.filter(g => g.status === 'IN_PROGRESS').length
    const notStarted = goals.filter(g => g.status === 'NOT_STARTED').length
    const submitted  = goals.filter(g => g.status === 'EMPLOYEE_SUBMITTED').length

    const dashboardGoals = goals.filter(
        g => g.status === 'IN_PROGRESS' || g.status === 'NOT_STARTED'
    )

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                name={name}
                initials={initials}
                department={department ?? '—'}
                role={role}
                activePage="Dashboard"
            />

            <div className="flex-1 py-4 px-5 flex flex-col gap-6 overflow-auto">
                <Topbar />

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Dashboard</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{currentAppraisal?.cycleName ?? '—'}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-3">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                    Current Appraisal Cycle
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-700">{currentAppraisal?.cycleName ?? '—'}</p>
                                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                        {currentAppraisal?.appraisalStatus.replace('_', ' ') ?? '—'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">Manager: {currentAppraisal?.managerName ?? '—'}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">Due {currentAppraisal ? formatDate(currentAppraisal.cycleEndDate) : '—'}</p>
                                    <p className={`text-xs font-semibold ${daysLeft <= 7 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {daysLeft} days left
                                    </p>
                                </div>
                            </div>

                            <GoalsPieChart
                                completed={completed}
                                inProgress={inProgress}
                                notStarted={notStarted}
                                submitted={submitted}
                                total={total}
                            />
                        </div>

                        <GoalsList goals={dashboardGoals} />
                    </>
                )}
            </div>
        </div>
    )
}