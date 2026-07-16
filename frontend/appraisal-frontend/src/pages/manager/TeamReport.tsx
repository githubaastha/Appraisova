import { useState, useEffect } from 'react'
import ManagerSidebar from '../../components/ManagerSidebar'
import CycleSelector from '../../components/manager/reports/CycleSelector'
import TeamReportStatCards from '../../components/manager/reports/TeamReportStatCards'
import TeamReportTable from '../../components/manager/reports/TeamReportTable'

import { getLoggedInUser } from '../../utils/auth'
import { getUsersByManager } from '../../api/usersApi'
import { getAppraisalsByManager, exportTeamReport } from '../../api/appraisalApi'
import { getGoalsByManager } from '../../api/goalApi'

import type { UserResponseDTO, AppraisalsByManagerDTO, GoalResponseDTO } from '../../types'
import Topbar from '@/components/Topbar'

export default function TeamReport() {
    const { name, initials, role, managerId, userId } = getLoggedInUser()

    const [selectedCycle, setSelectedCycle] = useState<string | null>(null)
    const [employees, setEmployees] = useState<UserResponseDTO[]>([])
    const [appraisals, setAppraisals] = useState<AppraisalsByManagerDTO[]>([])
    const [goals, setGoals] = useState<GoalResponseDTO[]>([])
    const [cycles, setCycles] = useState<string[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true);
            setError('');

            const [employeeData, appraisalResponse, goalData] = await Promise.all([
                getUsersByManager(userId),
                getAppraisalsByManager(userId, 0, 1000),
                getGoalsByManager(userId)
            ]);

            const appraisalData = appraisalResponse.content;

            setEmployees(employeeData);
            setAppraisals(appraisalData);
            setGoals(goalData);

            const uniqueCycles = Array.from(
                new Set(appraisalData.map(a => a.cycleName))
            );

            setCycles(uniqueCycles);

        } catch (error) {
            console.error(error);
            setError('Failed to load team report.');
        } finally {
            setLoading(false);
        }
    }

    const reportMembers = employees.map(emp => {
        const appraisal = appraisals.find(
            a => a.employeeEmail === emp.email && a.cycleName === selectedCycle
        )
        const goalsForMember = goals.filter(
            g => g.employeeId === emp.userId && g.cycleName === selectedCycle
        )

        return {
            employeeId: emp.userId,
            name: `${emp.firstName} ${emp.lastName}`,
            jobTitle: emp.designation ?? '—',
            status: appraisal?.appraisalStatus ?? 'PENDING',
            selfRating: appraisal?.selfRating ?? null,
            managerRating: appraisal?.managerRating ?? null,
            goalsCompleted: goalsForMember.filter(g => g.status === 'COMPLETED').length,
            goalsTotal: goalsForMember.length,
        }
    })

    const ratedMembers = reportMembers.filter(m => m.managerRating !== null)
    const avgRating = ratedMembers.length > 0
        ? ratedMembers.reduce((sum, m) => sum + (m.managerRating ?? 0), 0) / ratedMembers.length
        : null

    const handleDownloadReport = async () => {
        if (!selectedCycle) return

        try {
            setDownloading(true)
            setDownloadError('')

            const blob = await exportTeamReport(userId, selectedCycle)

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${selectedCycle.replace(/\s+/g, '_')}_Team_Report.xlsx`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
            setDownloadError('Failed to download report. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="Team Report"
                hasManager={!!managerId}
            />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar />

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold py-5 pt-0" style={{ color: '#111827' }}>Team Report</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Performance overview for your team by cycle</p>
                            </div>

                            <button
                                onClick={handleDownloadReport}
                                disabled={!selectedCycle || downloading}
                                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all mb-4 ${!selectedCycle || downloading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#1089D3] text-white hover:bg-[#0e7abf]'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                {downloading ? 'Downloading…' : 'Download Excel'}
                            </button>
                        </div>

                        {downloadError && (
                            <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                                {downloadError}
                            </p>
                        )}

                        <CycleSelector
                            cycles={cycles}
                            selectedCycle={selectedCycle}
                            onSelect={setSelectedCycle}
                        />

                        {selectedCycle === null ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                                <p className="text-sm text-gray-400">Select a cycle to view your team report</p>
                            </div>
                        ) : (
                            <>
                                <TeamReportStatCards
                                    teamMembers={reportMembers.length}
                                    avgRating={avgRating}
                                    cycleName={selectedCycle}
                                />
                                <TeamReportTable members={reportMembers} />
                            </>
                        )}
                    </>
                )}

            </div>
        </div>
    )
}