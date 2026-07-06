import { useState, useEffect } from 'react'

import ManagerSidebar from '../../components/ManagerSidebar'
import TeamMemberCard from '../../components/manager/teams/TeamMemberCard'

import { getLoggedInUser } from '../../utils/auth'
import { getUsersByManager } from '../../api/usersApi'
import { getAppraisalsByManager } from '../../api/appraisalApi'

import type { UserResponseDTO, AppraisalsByManagerDTO } from '../../types'
import Topbar from '@/components/Topbar'

export default function MyTeam() {
    const { name, initials, role, managerId, userId } = getLoggedInUser()

    const [employees, setEmployees] = useState<UserResponseDTO[]>([])
    const [appraisals, setAppraisals] = useState<AppraisalsByManagerDTO[]>([])
    const [activeCycle, setActiveCycle] = useState<string>('')
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true);

            const [employeeData, appraisalData] = await Promise.all([
                getUsersByManager(userId),
                getAppraisalsByManager(userId)
            ]);

            setEmployees(employeeData);
            setAppraisals(appraisalData);

            const cycles = Array.from(new Set(appraisalData.map(a => a.cycleName)));
            setActiveCycle(cycles[0] || '');

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="My Team"
                hasManager={!!managerId}
            />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar/>

                <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold " style={{ color: '#111827' }}>My Team</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {loading ? 'Loading...' : `${employees.length} members`}
                    </p>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-sm font-medium text-gray-500">No team members found</p>
                        <p className="text-xs text-gray-400 mt-1">Employees assigned to you will show up here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {employees.map(emp => {
                            const appraisal = appraisals.find(
                                a => a.employeeEmail === emp.email &&
                                    a.cycleName === activeCycle
                            );

                            return (
                                <TeamMemberCard
                                    key={emp.userId}
                                    employeeId={emp.userId}
                                    name={`${emp.firstName} ${emp.lastName}`}
                                    jobTitle={emp.designation ?? '—'}
                                    email={emp.email}
                                    department={emp.deptName ?? '—'}
                                    appraisalStatus={appraisal?.appraisalStatus ?? 'PENDING'}
                                    hasAppraisal={!!appraisal}
                                />
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    )
}