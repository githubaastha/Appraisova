import HRSidebar from '../../components/HRSidebar'
import HRStatCards from '../../components/hr/dashboard/HRStatCards'
import AllAppraisalsTable from '../../components/hr/dashboard/AllAppraisalTable'
import { useEffect, useState } from 'react'
import { getUsers } from '../../api/usersApi'
import { getDepartments } from '../../api/departmentApi'
import { getAllAppraisals, approveAppraisal } from '../../api/appraisalApi'
import { getLoggedInUser } from '../../utils/auth'
import type { AppraisalStatus } from '../../types'


interface AppraisalRow {
    appraisalId: number
    employeeName: string
    department: string
    managerName: string
    cycleName: string
    status: AppraisalStatus
    createdAt: string
}

function todayLabel(): string {
    return new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}



export default function HRDashboard() {
    const { name, initials, role } = getLoggedInUser()
    const [activeEmployees, setActiveEmployees] = useState(0)
    const [totalDepartments, setTotalDepartments] = useState(0)
    const [pendingApproval, setPendingApproval] = useState(0)
    const [activeCycles, setActiveCycles] = useState(0)
    const [appraisals, setAppraisals] = useState<AppraisalRow[]>([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        loadDashboard(true)
    }, [])

   async function loadDashboard(isInitialLoad = false) {
    try {
        if (isInitialLoad) setLoading(true)

        const [users, departments, appraisalResponse] = await Promise.all([
            getUsers(),
            getDepartments(),
            getAllAppraisals(0, 1000)
        ])

        const appraisalData = appraisalResponse.content

        setActiveEmployees(
            users.filter(u => u.isActive).length
        )

        setTotalDepartments(departments.length)

        setPendingApproval(
            appraisalData.filter(
                a => a.appraisalStatus === 'MANAGER_REVIEWED'
            ).length
        )

        setActiveCycles(
            new Set(
                appraisalData
                    .filter(a => a.appraisalStatus !== 'ACKNOWLEDGED')
                    .map(a => a.cycleName)
            ).size
        )

        setAppraisals(
            appraisalData.map(a => ({
                appraisalId: a.appraisalId,
                employeeName: a.employeeName,
                department: a.department,
                managerName: a.managerName,
                cycleName: a.cycleName,
                status: a.appraisalStatus,
                createdAt: a.createdAt
            }))
        )

    } catch (error) {
        console.error('Failed to load dashboard:', error)
    } finally {
        if (isInitialLoad) setLoading(false)
    }
}
          

    return (
        <div className="flex min-h-screen bg-gray-50">
            <HRSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="Dashboard"
            />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 pt-5 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>
                            Welcome, {name}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">{role}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">{todayLabel()}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Stat Cards — all dynamic */}
                        <HRStatCards
                            activeEmployees={activeEmployees}
                            totalDepartments={totalDepartments}
                            pendingApproval={pendingApproval}
                            activeCycles={activeCycles}
                        />

                        {/* All Appraisals */}
                        <AllAppraisalsTable
                            appraisals={appraisals}
                            onApprove={async (appraisal) => {
                                await approveAppraisal(appraisal.appraisalId)
                                await loadDashboard()
                            }}
                        />
                    </>
                )}

            </div>
        </div>
    )
}