import { useState, useEffect } from 'react'
import Topbar from '../components/Topbar'
import Sidebar from '../components/Sidebar'
import AppraisalListRow from '../components/appraisal/AppraisalListRow'
import { getLoggedInUser } from '../utils/auth'
import { getAppraisalsByEmployee } from '../api/appraisalApi'
import type { AppraisalsByEmployeeDTO } from '../types'

export default function Appraisal() {
    const { name, initials, department, role, userId } = getLoggedInUser()
    const [appraisals, setAppraisals] = useState<AppraisalsByEmployeeDTO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getAppraisalsByEmployee(userId)
            .then(setAppraisals)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                name={name}
                initials={initials}
                department={department ?? '—'}
                role={role}
                activePage="My Appraisal"
            />

            <div className="flex-1 py-4 px-5 flex flex-col gap-6 overflow-auto">
                <Topbar />

                <div className="flex items-center justify-between pb-3 mb-1 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>My Appraisal</h2>
                        <p className="text-xs text-gray-400 mt-1">
                            {loading ? 'Loading...' : `${appraisals.length} appraisal cycles`}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : appraisals.length === 0 ? (
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
                                basePath="/appraisal"
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}