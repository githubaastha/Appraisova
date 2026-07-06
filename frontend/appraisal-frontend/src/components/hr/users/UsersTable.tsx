interface User {
    userId: number
    name: string
    email: string
    role: string
    jobTitle: string
    department: string
    managerName: string
    isActive: boolean
    pendingActivation: boolean
}

interface Props {
    users: User[]
    onEdit: (userId: number) => void
    onDeactivate: (userId: number) => void
}

const ROLE_STYLES: Record<string, string> = {
    HR:       'bg-purple-50 text-purple-600',
    MANAGER:  'bg-blue-50 text-[#1089D3]',
    EMPLOYEE: 'bg-gray-100 text-gray-500',
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function UsersTable({ users, onEdit, onDeactivate }: Props) {
    if (users.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No users found</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Name</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Email</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Role</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Job Title</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Department</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Manager</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.userId} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                        {getInitials(user.name)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${ROLE_STYLES[user.role]}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">{user.jobTitle}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">{user.department}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">{user.managerName}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1 items-start">
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${
                                        user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                    }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {user.pendingActivation && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                                            Invite Pending
                                        </span>
                                    )}
                                </div>
                            </td>
                         <td className="px-6 py-4">
    <div className="flex gap-2">
        <div className="w-7">
            {user.role !== 'HR' && (
                <button
                    onClick={() => onEdit(user.userId)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#1089D3] transition-all"
                    title="Edit"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                </button>
            )}
        </div>
        <button
            onClick={() => onDeactivate(user.userId)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
            title={user.isActive ? 'Deactivate' : 'Activate'}
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
        </button>
    </div>
</td>
                                    
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}