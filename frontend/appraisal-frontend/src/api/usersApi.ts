import api from "./axios";
import type { UserRequestDTO, UserResponseDTO,BulkUserUploadResult } from "../types";




export const getUsers = async (): Promise<UserResponseDTO[]> => {
    const res = await api.get("/users");
    return res.data;
};

export const createUser = async (data: UserRequestDTO): Promise<UserResponseDTO> => {
    const res = await api.post("/users", data);
    return res.data;
};

export const updateFirstName = async (id: number, firstName: string) => {
    const res = await api.patch(`/users/${id}/firstname`, null, { params: { firstName } });
    return res.data;
};

export const updateLastName = async (id: number, lastName: string) => {
    const res = await api.patch(`/users/${id}/lastname`, null, { params: { lastName } });
    return res.data;
};

export const updateDesignation = async (id: number, designation: string) => {
    const res = await api.patch(`/users/${id}/designation`, null, { params: { designation } });
    return res.data;
};

export const updateManager = async (id: number, managerId: number) => {
    const res = await api.patch(`/users/${id}/manager`, null, { params: { managerId } });
    return res.data;
};

export const updateStatus = async (id: number, isActive: boolean) => {
    const res = await api.patch(`/users/${id}/status`, null, { params: { isActive } });
    return res.data;
};

export const deleteUser = async (id: number): Promise<string> => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
};
export const getUsersByManager = async (managerId: number) => {
    const res = await api.get<UserResponseDTO[]>(
        `/users/manager/${managerId}`
    );
    return res.data;
};
export const getUserById = async (id: number): Promise<UserResponseDTO> => {
    const res = await api.get<UserResponseDTO>(`/users/${id}`)
    return res.data
}

export const bulkUploadUsers = async (file: File): Promise<BulkUserUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
 
    const res = await api.post('/users/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};
 
export const downloadUserUploadTemplate = async (): Promise<Blob> => {
    const res = await api.get('/users/bulk-upload/template', {
        responseType: 'blob'
    });
    return res.data;
};

export const updatePassword = async (id: number, oldPassword: string, newPassword: string) => {
    const res = await api.patch(`/users/${id}/password`, null, {
        params: { oldPassword, newPassword }
    });
    return res.data;
};

export const updatePhone = async (id: number, phone: string) => {
    const res = await api.patch(`/users/${id}/phone`, null, { params: { phone } });
    return res.data;
};