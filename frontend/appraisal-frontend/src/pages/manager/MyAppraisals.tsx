import { useState, useEffect } from 'react'
import ManagerSidebar from '../../components/ManagerSidebar'
import AppraisalListRow from '../../components/appraisal/AppraisalListRow'
import { getLoggedInUser } from '../../utils/auth'
import { getAppraisalsByEmployee } from '../../api/appraisalApi'
import type { AppraisalsByEmployeeDTO } from '../../types'
import Topbar from '@/components/Topbar'

export default function MyAppraisals() {
    const { name, initials, role, managerId, userId } = getLoggedInUser()

    const [appraisals, setAppraisals] = useState<AppraisalsByEmployeeDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const data = await getAppraisalsByEmployee(userId)
                setAppraisals(data)

            } catch (err) {
                setError('Failed to load appraisals')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (userId) fetchData()
    }, [userId])

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <ManagerSidebar
                    name={name}
                    initials={initials}
                    role={role}
                    activePage="My Appraisals"
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
                    activePage="My Appraisals"
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
                activePage="My Appraisals"
                hasManager={!!managerId}
            />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar/>

                <div className="flex items-center justify-between pb-3 mb-1  border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: '#111827' }}>My Appraisals</h2>
                        <p className="text-xs text-gray-400 mt-1">{appraisals.length} appraisal cycles</p>
                    </div>
                </div>

                {appraisals.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-sm font-medium text-gray-500">No appraisal cycles yet</p>
                        <p className="text-xs text-gray-400 mt-1">Your appraisals will show up here once HR starts a cycle</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {appraisals.map(appraisal => (
                            <AppraisalListRow
                                key={appraisal.appraisalId}
                                appraisalId={appraisal.appraisalId}
                                cycleName={appraisal.cycleName}
                                cycleStartDate={appraisal.cycleStartDate}
                                cycleEndDate={appraisal.cycleEndDate}
                                status={appraisal.appraisalStatus}
                                basePath="/manager/my-appraisals"
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}