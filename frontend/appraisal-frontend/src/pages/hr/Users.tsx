import { useState, useEffect } from 'react'
import HRSidebar from '../../components/HRSidebar'
import UsersFilters from '../../components/hr/users/UsersFilters'
import UsersTable from '../../components/hr/users/UsersTable'
import AddUserModal from '../../components/hr/users/AddUserModal'
import BulkUploadUsersModal from '../../components/hr/users/BulkUploadUsersModal'
import EditUserModal from '../../components/hr/users/EditUserModal'
import { getLoggedInUser } from '../../utils/auth'
import CannotDeactivateModal from '@/components/hr/users/CannotDeactivateModal'
import { getUsers, updateStatus, updateFirstName, updateDesignation, updateLastName, updateManager } from '../../api/usersApi'
import type { UserResponseDTO } from '../../types'

export default function Users() {
    const { name, initials, role } = getLoggedInUser()
    const [users, setUsers] = useState<UserResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [activeRole, setActiveRole] = useState('ALL')
    const [activeDepartment, setActiveDepartment] = useState('ALL')
    const [activeStatus, setActiveStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
    const [blockedManager, setBlockedManager] = useState<UserResponseDTO | null>(null)
    const [editingUser, setEditingUser] = useState<{
        userId: number
        name: string
        email: string
        role: string
        jobTitle: string
        department: string
        managerName: string
    } | null>(null)

   useEffect(() => {
    fetchUsers(true);

    const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
            fetchUsers();
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
}, []);

    const fetchUsers = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) setLoading(true)
            const data = await getUsers()
            setUsers(data)
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            if (isInitialLoad) setLoading(false)
        }
    }

    const roles = Array.from(new Set(users.map(u => u.role)))
    const departments = Array.from(new Set(users.map(u => u.deptName).filter(Boolean) as string[]))
    const managers = users
        .filter(u => u.role === "MANAGER" && u.isActive)
        .map(m => ({
            userId: m.userId!,
            name: `${m.firstName} ${m.lastName}`,
            deptId: m.deptId,
        }));

    const filteredUsers = users.filter(u => {
        if (activeRole !== 'ALL' && u.role !== activeRole) return false
        if (activeDepartment !== 'ALL' && u.deptName !== activeDepartment) return false
        if (activeStatus === 'ACTIVE' && !u.isActive) return false
        if (activeStatus === 'INACTIVE' && u.isActive) return false
        return true
    })

    const handleEdit = (userId: number) => {
        const user = users.find(u => u.userId === userId)
        if (!user) return
        setEditingUser({
            userId: user.userId!,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            jobTitle: user.designation ?? '',
            department: user.deptName ?? '',
            managerName: user.managerName ?? '',
        })
    }

    const handleSaveEdit = async (userId: number, data: {
        name: string
        role: string
        jobTitle: string
        department: string
        managerId: number | null
    }) => {
        try {
            const [firstName, ...rest] = data.name.trim().split(' ')
            const lastName = rest.join(' ') || firstName


            await updateFirstName(userId, firstName)
            await updateLastName(userId, lastName)
            await updateDesignation(userId, data.jobTitle)
            if (data.managerId) {
                await updateManager(userId, data.managerId)
            }

            await fetchUsers()
            setEditingUser(null)
        } catch (err) {
            console.error('Failed to update user:', err)
        }
    }



    const handleDeactivate = async (userId: number) => {
        const user = users.find(u => u.userId === userId)
        if (!user) return

        if (user.isActive && user.role === 'MANAGER') {
            const managerFullName = `${user.firstName} ${user.lastName}`
            const hasActiveReports = users.some(
                u => u.managerName === managerFullName && u.isActive && u.userId !== userId
            )
            if (hasActiveReports) {
                setBlockedManager(user)
                return
            }
        }

        try {
            await updateStatus(userId, !user.isActive)
            setUsers(prev => prev.map(u =>
                u.userId === userId ? { ...u, isActive: !u.isActive } : u
            ))
        } catch (err) {
            console.error('Failed to update status:', err)
        }
    }


    return (
        <div className="flex min-h-screen bg-gray-50">
            <HRSidebar name={name} initials={initials} role={role} activePage="Users" />

            {showAddModal && (
                <AddUserModal
                    managers={managers}
                    onClose={() => setShowAddModal(false)}
                    onAdded={() => fetchUsers()}
                />
            )}

            {showBulkUploadModal && (
                <BulkUploadUsersModal
                    onClose={() => setShowBulkUploadModal(false)}
                    onAdded={() => fetchUsers()}
                />
            )}

            {blockedManager && (
                <CannotDeactivateModal
                    manager={blockedManager}
                    affectedEmployees={users.filter(
                        u => u.managerName === `${blockedManager.firstName} ${blockedManager.lastName}` && u.isActive
                    )}
                    otherManagersInDept={users.filter(
                        u => u.role === 'MANAGER' && u.deptName === blockedManager.deptName && u.userId !== blockedManager.userId && u.isActive
                    )}
                    onClose={() => setBlockedManager(null)}
                    onReassigned={() => fetchUsers()}
                />
            )}

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    departments={departments}
                    managers={managers}
                    onClose={() => setEditingUser(null)}
                    onSave={handleSaveEdit}
                />
            )}

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">

                <div className="flex items-center justify-between pb-4 pt-5 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>Users</h2>
                        <p className="text-xs text-gray-400 mt-1">Manage all employees, managers, and HR accounts</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setShowBulkUploadModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7.5L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Bulk Upload
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add User
                        </button>
                    </div>
                </div>

                <UsersFilters
                    roles={roles}
                    departments={departments}
                    activeRole={activeRole}
                    activeDepartment={activeDepartment}
                    activeStatus={activeStatus}
                    onRoleChange={setActiveRole}
                    onDepartmentChange={setActiveDepartment}
                    onStatusChange={setActiveStatus}
                />

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-sm font-medium text-gray-500">No users found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters, or add a new user</p>
                    </div>
                ) : (
                    <UsersTable
                        users={filteredUsers.map(u => ({
                            userId: u.userId!,
                            name: `${u.firstName} ${u.lastName}`,
                            email: u.email,
                            role: u.role,
                            jobTitle: u.designation ?? '—',
                            department: u.deptName ?? '—',
                            managerName: u.managerName ?? '—',
                            isActive: u.isActive ?? false,
                            pendingActivation: u.pendingActivation ?? false,
                        }))}
                        onEdit={handleEdit}
                        onDeactivate={handleDeactivate}
                    />
                )}

            </div>
        </div>
    )
}