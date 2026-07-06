import type { GoalStatus } from '../../../types'

interface Employee {
    employeeId: number
    name: string
}

interface Props {
    employees: Employee[]
    cycles: string[]
    activeEmployee: number | 'ALL'
    activeStatus: GoalStatus | 'ALL'
    activeCycle: string
    onEmployeeChange: (value: number | 'ALL') => void
    onStatusChange: (value: GoalStatus | 'ALL') => void
    onCycleChange: (value: string) => void
}

const STATUS_OPTIONS: { label: string; value: GoalStatus | 'ALL' }[] = [
    { label: 'All Status',     value: 'ALL' },
    { label: 'Not Started',    value: 'NOT_STARTED' },
    { label: 'In Progress',    value: 'IN_PROGRESS' },
    { label: 'Submitted',      value: 'EMPLOYEE_SUBMITTED' },
    { label: 'Completed',      value: 'COMPLETED' },
    { label: 'Not Completed',  value: 'NOT_COMPLETED' },
    { label: 'Cancelled',      value: 'CANCELLED' },
]

export default function TeamGoalsFilters({
    employees, cycles, activeEmployee, activeStatus, activeCycle,
    onEmployeeChange, onStatusChange, onCycleChange,
}: Props) {
    return (
        <div className="flex gap-3">

            {/* Employee Dropdown */}
            <select
                value={activeEmployee}
                onChange={(e) => onEmployeeChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] cursor-pointer"
            >
                <option value="ALL">All Employees</option>
                {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>
                ))}
            </select>

            {/* Status Dropdown */}
            <select
                value={activeStatus}
                onChange={(e) => onStatusChange(e.target.value as GoalStatus | 'ALL')}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] cursor-pointer"
            >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            {/* Cycle Dropdown */}
            <select
                value={activeCycle}
                onChange={(e) => onCycleChange(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] cursor-pointer"
            >
                {cycles.map(cycle => (
                    <option key={cycle} value={cycle}>{cycle}</option>
                ))}
            </select>

        </div>
    )
}