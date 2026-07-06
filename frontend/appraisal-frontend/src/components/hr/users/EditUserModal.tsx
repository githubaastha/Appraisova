import { useState } from 'react'

interface Props {
    user: {
        userId: number
        name: string
        email: string
        role: string
        jobTitle: string
        department: string
        managerName: string
    }
    departments: string[]
    managers: { userId: number; name: string }[]
    onClose: () => void
    onSave: (userId: number, data: {
        name: string
        role: string
        jobTitle: string
        department: string
        managerId: number | null
    }) => void
}

export default function EditUserModal({ user, departments, managers, onClose, onSave }: Props) {
    const initialManagerId = managers.find(m => m.name === user.managerName)?.userId ?? ''

    const [name, setName]             = useState(user.name)
    const [role, setRole]             = useState(user.role)
    const [jobTitle, setJobTitle]     = useState(user.jobTitle)
    const [department, setDepartment] = useState(user.department)
    const [managerId, setManagerId]   = useState<number | ''>(initialManagerId)
    const [error, setError]           = useState('')

    const showManagerField = role === 'EMPLOYEE' || role === 'MANAGER'
    const managerRequired  = role === 'EMPLOYEE'

    const getRoleOptions = () => {
        if (user.role === 'MANAGER') {
            return (
                <>
                    <option value="MANAGER">Manager</option>
                    <option value="HR">HR</option>
                </>
            )
        }
        return (
            <>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
            </>
        )
    }

    const handleSubmit = () => {
        if (!name.trim()) return setError('Name cannot be empty')
        if (!jobTitle.trim()) return setError('Job title cannot be empty')
        if (!department) return setError('Please select a department')
        if (managerRequired && !managerId) return setError('Please select a manager — every employee must report to someone')

        onSave(user.userId, {
            name,
            role,
            jobTitle,
            department,
            managerId: managerId === '' ? null : Number(managerId),
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Edit User</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-400 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                        {user.email}
                    </p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Role</label>
                    <select
                        value={role}
                        onChange={(e) => {
                            const newRole = e.target.value
                            setRole(newRole)
                            setManagerId('')
                            setDepartment(newRole === 'HR' ? 'HR' : '')
                        }}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                    >
                        {getRoleOptions()}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Job Title</label>
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                {role !== 'HR' && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500">Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                        >
                            <option value="">Select a department</option>
                            {departments.filter(d => d !== 'HR').map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                )}

                {showManagerField && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500">
                            Manager{managerRequired ? '' : ' (optional)'}
                        </label>
                        <select
                            value={managerId}
                            onChange={(e) => setManagerId(e.target.value === '' ? '' : Number(e.target.value))}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                        >
                            <option value="">{managerRequired ? 'Select a manager' : 'No manager'}</option>
                            {managers.map(m => <option key={m.userId} value={m.userId}>{m.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                    >
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    )
}