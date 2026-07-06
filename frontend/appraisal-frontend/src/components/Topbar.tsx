import { useState, useRef, useEffect } from 'react'
import { getLoggedInUser } from '../utils/auth'
import { getNotificationsByUser, markAsRead, markAllAsRead } from '../api/notificationApi'
import type { NotificationSummaryDTO } from '../api/notificationApi'

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function Topbar() {
    const { userId } = getLoggedInUser()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationSummaryDTO[]>([])
    const dropdownRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.isRead).length

    useEffect(() => {
        getNotificationsByUser(userId).then(setNotifications)
    }, [])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function handleMarkAsRead(notificationId: number) {
        await markAsRead(notificationId)
        setNotifications(prev =>
            prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
        )
    }

    async function handleMarkAllAsRead() {
        await markAllAsRead(userId)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    return (
        <div className="flex justify-end w-full px-5 pt-1">
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setOpen(prev => !prev)}
                    className="relative text-gray-500 hover:text-[#1089D3] transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {open && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">Notifications</p>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#1089D3] hover:bg-blue-100 transition-all"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.notificationId}
                                        onClick={() => !n.isRead && handleMarkAsRead(n.notificationId)}
                                        className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-[#1089D3]'}`} />
                                        <div>
                                            <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="px-4 py-2.5 text-center border-t border-gray-100">
                            <p className="text-xs text-gray-400">Click a notification to mark as read</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}