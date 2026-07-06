import api from './axios'

export interface NotificationSummaryDTO {
    notificationId: number
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
}

export const getNotificationsByUser = async (userId: number): Promise<NotificationSummaryDTO[]> => {
    const res = await api.get(`/notifications/user/${userId}`)
    return res.data
}

export const markAsRead = async (notificationId: number): Promise<string> => {
    const res = await api.patch(`/notifications/${notificationId}/read`)
    return res.data
}

export const markAllAsRead = async (userId: number): Promise<string> => {
    const res = await api.patch(`/notifications/user/${userId}/read-all`)
    return res.data
}