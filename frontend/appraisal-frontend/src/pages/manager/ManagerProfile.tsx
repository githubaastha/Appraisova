import { useState, useEffect } from 'react'
import ManagerSidebar from '../../components/ManagerSidebar'
import Topbar from '../../components/Topbar'
import Badge from '../../components/profile/Badge'
import InfoField from '../../components/profile/InfoField'
import ChangePasswordModal from '../../components/profile/ChangePasswordModel'
import { getLoggedInUser } from '../../utils/auth'
import { getUserById, updatePhone } from '../../api/usersApi'
import type { UserResponseDTO } from '../../types'

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

function isPhoneValid(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone.trim())
}

export default function ManagerProfile() {
    const { userId, managerId } = getLoggedInUser()
    const [showModal, setShowModal] = useState(false)
    const [user, setUser] = useState<UserResponseDTO | null>(null)
    const [loading, setLoading] = useState(true)

    const [editingPhone, setEditingPhone] = useState(false)
    const [phoneInput, setPhoneInput] = useState('')
    const [phoneError, setPhoneError] = useState('')
    const [savingPhone, setSavingPhone] = useState(false)

    useEffect(() => {
        getUserById(userId)
            .then(setUser)
            .finally(() => setLoading(false))
    }, [])

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
            </div>
        )
    }

    const fullName = `${user.firstName} ${user.lastName}`
    const initials = getInitials(user.firstName, user.lastName)

    const startEditingPhone = () => {
        setPhoneInput(user.phone ?? '')
        setPhoneError('')
        setEditingPhone(true)
    }

    const cancelEditingPhone = () => {
        setEditingPhone(false)
        setPhoneError('')
    }

    const savePhone = async () => {
        setPhoneError('')

        if (!phoneInput.trim()) {
            setPhoneError('Phone number is required')
            return
        }
        if (!isPhoneValid(phoneInput)) {
            setPhoneError('Enter a valid 10-digit phone number')
            return
        }

        setSavingPhone(true)
        try {
            const updated = await updatePhone(userId, phoneInput.trim())
            setUser(updated)
            setEditingPhone(false)
        } catch (err: any) {
            setPhoneError(err.response?.data || 'Failed to update phone number')
        } finally {
            setSavingPhone(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar
                name={fullName}
                initials={initials}
                role={user.role}
                activePage="Profile"
                hasManager={!!managerId}
            />

            {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}

            <div className="flex-1 px-5 py-4 flex flex-col">
                <Topbar />

                <div className="flex flex-col gap-6">

                    <div className="pb-3 border-b border-gray-200">
                        <h2 className="text-sm font-semibold leading-none" style={{ color: '#111827' }}>My Profile</h2>
                        <p className="text-gray-400 text-xs mt-1">View your account information</p>
                    </div>

                    <div className="grid grid-cols-[220px_1fr] gap-6">

                        <div className="bg-white border border-gray-200 rounded-xl px-5 py-6 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-xl font-bold">
                                {initials}
                            </div>

                            <div className="text-center flex flex-col gap-1">
                                <p className="text-sm font-bold" style={{ color: '#111827' }}>{fullName}</p>
                                <p className="text-xs text-gray-400">{user.designation}</p>
                                <div className="flex gap-2 justify-center mt-1">
                                    <Badge label={user.role} variant="blue" />
                                </div>
                            </div>

                            <div className="w-full border-t border-gray-100" />

                            <div className="w-full flex flex-col gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-xs font-medium text-gray-700">{user.email}</p>
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone</p>
                                        {!editingPhone && (
                                            <button
                                                onClick={startEditingPhone}
                                                className="text-gray-300 hover:text-[#1089D3] transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {editingPhone ? (
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            <input
                                                value={phoneInput}
                                                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="Enter phone number"
                                                autoFocus
                                                className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 transition-all ${
                                                    phoneError
                                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                                        : 'border-gray-200 focus:border-[#1089D3] focus:ring-[#1089D3]/20'
                                                }`}
                                            />
                                            {phoneError && (
                                                <p className="text-[10px] text-red-500">{phoneError}</p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={savePhone}
                                                    disabled={savingPhone}
                                                    className="flex-1 py-1.5 rounded-lg text-[11px] font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all disabled:opacity-50"
                                                >
                                                    {savingPhone ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={cancelEditingPhone}
                                                    disabled={savingPhone}
                                                    className="flex-1 py-1.5 rounded-lg text-[11px] font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-medium text-gray-700">{user.phone ?? '—'}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Member Since</p>
                                    <p className="text-xs font-medium text-gray-700">{user.createdAt ? formatDateTime(user.createdAt) : '—'}</p>
                                </div>
                            </div>

                            <div className="w-full border-t border-gray-100" />

                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#1089D3] hover:text-[#1089D3] transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                Change Password
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-4">
                                    Personal Information
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoField label="First Name"  value={user.firstName} />
                                    <InfoField label="Last Name"   value={user.lastName} />
                                    <InfoField label="Designation" value={user.designation ?? '—'} />
                                    <InfoField label="Role"        value={user.role} />
                                    <InfoField label="Department"  value={user.deptName ?? '—'} />
                                    <InfoField label="Manager"     value={user.managerName ?? '—'} />
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-4">
                                    Account Information
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoField label="User ID"      value={`${user.userId}`} />
                                    <InfoField label="Member Since" value={user.createdAt ? formatDateTime(user.createdAt) : '—'} />
                                    <InfoField label="Last Updated" value={user.updatedAt ? formatDateTime(user.updatedAt) : '—'} />
                                    <InfoField
                                        label="Status"
                                        value={user.isActive ? 'Active' : 'Inactive'}
                                        valueClassName={user.isActive ? 'text-green-600' : 'text-red-500'}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}