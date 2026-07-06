import api from "./axios";

import type { InviteDetails } from "../types";


export const getInviteDetails = async (token: string): Promise<InviteDetails> => {
    const res = await api.get(`/auth/invite/${token}`);
    return res.data;
};

export const activateAccount = async (
    token: string,
    firstName: string,
    lastName: string,
    phone: string,
    password: string
): Promise<string> => {
    const res = await api.post(`/auth/invite/${token}/activate`, { firstName, lastName, phone, password });
    return res.data;
};

export const forgotPassword = async (email: string): Promise<string> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    const res = await api.post(`/auth/reset-password/${token}`, { newPassword });
    return res.data;
};