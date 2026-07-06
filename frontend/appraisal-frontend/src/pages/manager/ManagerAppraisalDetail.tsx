import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ManagerSidebar from '../../components/ManagerSidebar'
import AppraisalDetailContent from '../../components/appraisal/AppraisalDetailContent'
import { getLoggedInUser } from '../../utils/auth'
import { getAppraisalById } from '../../api/appraisalApi'
import type { EmployeeAppraisalResponseDTO } from '../../types'
import Topbar from '@/components/Topbar'

export default function ManagerAppraisalDetail() {
    const { appraisalId } = useParams()
    const navigate = useNavigate()
    const { name, initials, role, managerId } = getLoggedInUser()

    const [appraisal, setAppraisal] = useState<EmployeeAppraisalResponseDTO | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                if (appraisalId) {
                    const data = await getAppraisalById(Number(appraisalId))
                    setAppraisal(data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [appraisalId])

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

    if (!appraisal) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <ManagerSidebar name={name} initials={initials} role={role} activePage="My Appraisals" hasManager={!!managerId} />
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-500 font-medium">Appraisal not found</p>
                    <button
                        onClick={() => navigate('/manager/my-appraisals')}
                        className="text-xs text-[#1089D3] font-medium hover:underline"
                    >
                        ← Back to My Appraisals
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">

            <ManagerSidebar name={name} initials={initials} role={role} activePage="My Appraisals" hasManager={!!managerId} />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar/>

                <div className="flex items-center justify-between pb-3 mb-1 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>{appraisal.cycleName}</h2>
                        <p className="text-xs text-gray-400 ">Appraisal Detail</p>
                    </div>
                    <button
                        onClick={() => navigate('/manager/my-appraisals')}
                        className="text-xs text-[#1089D3] font-medium hover:underline"
                    >
                        ← Back to My Appraisals
                    </button>
                </div>

                <AppraisalDetailContent
                    appraisalId={appraisal.appraisalId}
                    cycleName={appraisal.cycleName}
                    cycleStartDate={appraisal.cycleStartDate}
                    cycleEndDate={appraisal.cycleEndDate}
                    managerName={appraisal.managerName ?? '—'}
                    managerEmail={appraisal.managerEmail ?? '—'}
                    status={appraisal.appraisalStatus}
                    isClosed={appraisal.cycleStatus === 'CLOSED'}
                    whatWentWell={appraisal.whatWentWell ?? ''}
                    whatToImprove={appraisal.whatToImprove ?? ''}
                    achievements={appraisal.achievements ?? ''}
                    selfRating={appraisal.selfRating}
                    managerStrengths={appraisal.managerStrengths ?? ''}
                    managerImprove={appraisal.managerImprove ?? ''}
                    managerComments={appraisal.managerComments ?? ''}
                    managerRating={appraisal.managerRating}
                    approvedAt={appraisal.approvedAt}
                    goals={[]}
                    onStatusChange={(newStatus) => setAppraisal(prev => prev ? { ...prev, appraisalStatus: newStatus } : prev)}
                />

            </div>
        </div>
    )
}