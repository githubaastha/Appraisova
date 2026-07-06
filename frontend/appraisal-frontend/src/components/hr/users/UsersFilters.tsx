interface Props {
    roles: string[]
    departments: string[]
    activeRole: string
    activeDepartment: string
    activeStatus: 'ALL' | 'ACTIVE' | 'INACTIVE'
    onRoleChange: (value: string) => void
    onDepartmentChange: (value: string) => void
    onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void
}

export default function UsersFilters({
    roles, departments, activeRole, activeDepartment, activeStatus,
    onRoleChange, onDepartmentChange, onStatusChange,
}: Props) {
    return (
        <div className="flex gap-3">

            <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] cursor-pointer"
            >
                <option value="ALL">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
                value={activeDepartment}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] cursor-pointer"
            >
                <option value="ALL">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
                value={activeStatus}
                onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-[#1089D3] cursor-pointer"
            >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
            </select>

        </div>
    )
}