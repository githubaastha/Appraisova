import type { AppraisalStatus } from '../../../types'

interface Props {
    search: string
    selectedCycle: string
    selectedStatus: AppraisalStatus | 'ALL'
    selectedDept: string
    cycles: string[]
    departments: string[]
    onSearchChange: (val: string) => void
    onCycleChange: (val: string) => void
    onStatusChange: (val: AppraisalStatus | 'ALL') => void
    onDeptChange: (val: string) => void
    onClear: () => void
    
}

const STATUS_OPTIONS: { label: string; value: AppraisalStatus | 'ALL' }[] = [
    { label: 'All Status',      value: 'ALL' },
    { label: 'Pending',           value: 'PENDING' },
    { label: 'Draft',             value: 'EMPLOYEE_DRAFT' },
    { label: 'Self Submitted',    value: 'SELF_SUBMITTED' },
    { label: 'Manager Draft',     value: 'MANAGER_DRAFT' },
    { label: 'Manager Reviewed',  value: 'MANAGER_REVIEWED' },
    { label: 'Approved',          value: 'APPROVED' },
    { label: 'Acknowledged',      value: 'ACKNOWLEDGED' },
]

export default function AppraisalFilters({
    search, selectedCycle, selectedStatus, selectedDept,
    cycles, departments,
    onSearchChange, onCycleChange, onStatusChange, onDeptChange,
    onClear, 
}: Props) {

    const hasActiveFilter =
        search !== '' ||
        selectedCycle !== 'ALL' ||
        selectedStatus !== 'ALL' ||
        selectedDept !== 'ALL'

    return (
        <div className="flex items-center gap-3 flex-wrap">

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search employee..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1089D3] focus:ring-1 focus:ring-[#1089D3] transition-all w-48"
                />
            </div>

            {/* Cycle filter */}
            <select
                value={selectedCycle}
                onChange={e => onCycleChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] transition-all"
            >
                <option value="ALL">All Cycles</option>
                {cycles.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Status filter */}
            <select
                value={selectedStatus}
                onChange={e => onStatusChange(e.target.value as AppraisalStatus | 'ALL')}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] transition-all"
            >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Department filter */}
            <select
                value={selectedDept}
                onChange={e => onDeptChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] transition-all"
            >
                <option value="ALL">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Clear filters */}
            {hasActiveFilter && (
                <button
                    onClick={onClear}
                    className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                >
                    Clear filters
                </button>
            )}

           

        </div>
    )
}