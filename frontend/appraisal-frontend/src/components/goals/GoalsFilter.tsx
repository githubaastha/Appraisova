import type { GoalStatus } from '../../types'

interface Props {
    activeFilter: GoalStatus | 'ALL'
    onChange: (filter: GoalStatus | 'ALL') => void
}

const FILTERS: { label: string; value: GoalStatus | 'ALL' }[] = [
    { label: 'All',           value: 'ALL' },
    { label: 'Not Started',   value: 'NOT_STARTED' },
    { label: 'In Progress',   value: 'IN_PROGRESS' },
    { label: 'Submitted',     value: 'EMPLOYEE_SUBMITTED' },
    { label: 'Completed',     value: 'COMPLETED' },
    { label: 'Not Completed', value: 'NOT_COMPLETED' },
    { label: 'Cancelled',     value: 'CANCELLED' },
]

export default function GoalsFilter({ activeFilter, onChange }: Props) {
    return (
        <div className="flex gap-2 flex-wrap">
            {FILTERS.map(filter => (
                <button
                    key={filter.value}
                    onClick={() => onChange(filter.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeFilter === filter.value
                            ? 'bg-[#1089D3] text-white'
                            : 'bg-white border border-gray-200 text-gray-400 hover:border-[#1089D3] hover:text-[#1089D3]'
                    }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}