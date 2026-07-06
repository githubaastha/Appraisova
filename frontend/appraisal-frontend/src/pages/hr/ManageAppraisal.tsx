import { useState, useEffect } from 'react'
import {
    getAllAppraisals,
    approveAppraisal,
    updateAppraisal
} from '../../api/appraisalApi'
import HRSidebar from '../../components/HRSidebar'
import AppraisalStatCards from '../../components/hr/manageappraisal/AppraisalStatCards'
import AppraisalFilters from '../../components/hr/manageappraisal/AppraisalFilters'
import ManageAppraisalsTable from '../../components/hr/manageappraisal/ManageAppraisalsTable'
import EditAppraisalModal from '../../components/hr/manageappraisal/EditAppraisalModal'
import type { AppraisalStatus } from '../../types'
import { getLoggedInUser } from '../../utils/auth'

interface AppraisalRow {
    appraisalId: number
    employeeName: string
    department: string
    managerName: string
    managerId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    status: AppraisalStatus
    createdAt: string
}
export default function ManageAppraisals() {
    const { name, initials, role } = getLoggedInUser()
    const [appraisals, setAppraisals] = useState<AppraisalRow[]>([])
    const [search, setSearch] = useState('')
    const [selectedCycle, setSelectedCycle] = useState('ALL')
    const [selectedStatus, setSelectedStatus] = useState<AppraisalStatus | 'ALL'>('ALL')
    const [selectedDept, setSelectedDept] = useState('ALL')
    const [editing, setEditing] = useState<AppraisalRow | null>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        loadAppraisals(true)
    }, [])
    const loadAppraisals = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) setLoading(true)

            const data = await getAllAppraisals()

            const rows = data.map(a => ({
                appraisalId: a.appraisalId,
                employeeName: a.employeeName,
                department: a.department,
                managerName: a.managerName,
                managerId: a.managerId,
                cycleName: a.cycleName,
                cycleStartDate: a.cycleStartDate,
                cycleEndDate: a.cycleEndDate,
                status: a.appraisalStatus,
                createdAt: a.createdAt
            }))

            setAppraisals(rows)
        } catch (error) {
            console.error(error)
        } finally {
            if (isInitialLoad) setLoading(false)
        }
    }

    const cycles = [...new Set(appraisals.map(a => a.cycleName))]
    const departments = [
        'ALL',
        ...new Set(appraisals.map(a => a.department).filter(Boolean))
    ]

    const filtered = appraisals.filter(a => {
        const matchSearch = a.employeeName.toLowerCase().includes(search.toLowerCase())
        const matchCycle = selectedCycle === 'ALL' || a.cycleName === selectedCycle
        const matchStatus = selectedStatus === 'ALL' || a.status === selectedStatus
        const matchDept = selectedDept === 'ALL' || a.department === selectedDept
        return matchSearch && matchCycle && matchStatus && matchDept
    })

    // ── Stat counts ───────────────────────────────────────────────────────────
    const total = appraisals.length
    const pending = appraisals.filter(a => a.status === 'PENDING').length
    const selfSubmitted = appraisals.filter(a => a.status === 'SELF_SUBMITTED').length
    const managerReviewed = appraisals.filter(a => a.status === 'MANAGER_REVIEWED').length
    const approved = appraisals.filter(a => a.status === 'APPROVED').length
    const acknowledged = appraisals.filter(a => a.status === 'ACKNOWLEDGED').length


    async function handleApprove(appraisal: AppraisalRow) {
        try {
            await approveAppraisal(appraisal.appraisalId)
            await loadAppraisals()
        } catch (error) {
            console.error(error)
        }
    }

    async function handleSaveEdit(payload: {
        cycleName: string
        cycleStartDate: string
        cycleEndDate: string
        managerId: number
    }) {
        if (!editing) return

        await updateAppraisal(editing.appraisalId, payload)

        await loadAppraisals()
        setEditing(null)
    }

    function handleClear() {
        setSearch('')
        setSelectedCycle('ALL')
        setSelectedStatus('ALL')
        setSelectedDept('ALL')
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <HRSidebar name={name} initials={initials} role={role} activePage="Manage Appraisals" />

            {editing && (
                <EditAppraisalModal
                    appraisal={editing}
                    onClose={() => setEditing(null)}
                    onSave={handleSaveEdit}
                />
            )}

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">

                {/* Header */}
                <div className="pb-3 border-b pt-5 border-gray-200">
                    <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>
                        Manage Appraisals
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">View, approve and manage all appraisals</p>
                </div>

                {/* Stat Cards */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <AppraisalStatCards
                            total={total}
                            pending={pending}
                            selfSubmitted={selfSubmitted}
                            managerReviewed={managerReviewed}
                            approved={approved}
                            acknowledged={acknowledged}
                        />

                        <AppraisalFilters
                            search={search}
                            selectedCycle={selectedCycle}
                            selectedStatus={selectedStatus}
                            selectedDept={selectedDept}
                            cycles={cycles}
                            departments={departments}
                            onSearchChange={setSearch}
                            onCycleChange={setSelectedCycle}
                            onStatusChange={setSelectedStatus}
                            onDeptChange={setSelectedDept}
                            onClear={handleClear}
                        />

                        {filtered.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                                <p className="text-sm font-medium text-gray-500">No appraisals match your filters</p>
                                <p className="text-xs text-gray-400 mt-1">Try adjusting or clearing the filters above</p>
                            </div>
                        ) : (
                            <ManageAppraisalsTable
                                appraisals={filtered}
                                onApprove={handleApprove}
                                onEdit={setEditing}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}