import api from './axios'
import type {
    AppraisalsRequestDTO,
    AppraisalsSummaryDTO,
    AppraisalsByEmployeeDTO,
    EmployeeAppraisalResponseDTO,
    ManagerReviewDTO,
    SelfAssessmentDTO,
    ManagerAppraisalResponseDTO,

} from '../types'
import type { AppraisalsByManagerDTO } from '../types'

export interface PagedResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
}

export const getAllAppraisals = async (
    page: number = 0,
    size: number = 20
): Promise<PagedResponse<AppraisalsSummaryDTO>> => {
    const res = await api.get('/appraisals', { params: { page, size } })
    return res.data
}


export const createBulkAppraisals = async (
    dtos: AppraisalsRequestDTO[]
): Promise<AppraisalsSummaryDTO[]> => {
    const res = await api.post('/appraisals/bulk', dtos)
    return res.data
}

export const approveAppraisal = async (id: number): Promise<AppraisalsSummaryDTO> => {
    const res = await api.patch(`/appraisals/${id}/approve`)
    return res.data
}

export const deleteAppraisal = async (id: number): Promise<string> => {
    const res = await api.delete(`/appraisals/${id}`)
    return res.data
}

export interface AppraisalUpdatePayload {
    cycleName?: string
    cycleStartDate?: string
    cycleEndDate?: string
    managerId?: number
}

export const updateAppraisal = async (
    id: number,
    dto: AppraisalUpdatePayload
): Promise<AppraisalsSummaryDTO> => {
    const res = await api.put(`/appraisals/${id}`, dto)
    return res.data
}
export const getAppraisalsByEmployee = async (
    employeeId: number
): Promise<AppraisalsByEmployeeDTO[]> => {
    const res = await api.get(`/appraisals/employee/${employeeId}`)
    return res.data
}
export const getAppraisalsByManager = async (
    managerId: number,
    page: number = 0,
    size: number = 20
): Promise<PagedResponse<AppraisalsByManagerDTO>> => {
    const res = await api.get(`/appraisals/manager/${managerId}`, { params: { page, size } })
    return res.data
}

export const getAppraisalById = async (id: number): Promise<EmployeeAppraisalResponseDTO> => {
    const res = await api.get(`/appraisals/${id}`)
    return res.data
}
export const saveManagerReviewDraft = async (id: number, dto: ManagerReviewDTO): Promise<ManagerReviewDTO> => {
    const res = await api.put(`/appraisals/${id}/manager-review/draft`, dto)
    return res.data
}

export const submitManagerReview = async (id: number, dto: ManagerReviewDTO): Promise<ManagerReviewDTO> => {
    const res = await api.put(`/appraisals/${id}/manager-review/submit`, dto)
    return res.data
}
export const saveSelfAssessmentDraft = async (id: number, dto: SelfAssessmentDTO): Promise<EmployeeAppraisalResponseDTO> => {
    const res = await api.put(`/appraisals/${id}/self-assessment/draft`, dto)
    return res.data
}

export const submitSelfAssessment = async (id: number, dto: SelfAssessmentDTO): Promise<EmployeeAppraisalResponseDTO> => {
    const res = await api.put(`/appraisals/${id}/self-assessment/submit`, dto)
    return res.data
}

export const getAppraisalForManager = async (id: number): Promise<ManagerAppraisalResponseDTO> => {
    const res = await api.get(`/appraisals/${id}/manager-view`)
    return res.data
}


export const exportAppraisalReport = async (cycleName: string): Promise<Blob> => {
    const res = await api.get('/appraisals/report/export', {
        params: { cycleName },
        responseType: 'blob'
    })
    return res.data
}


export const exportTeamReport = async (managerId: number, cycleName: string): Promise<Blob> => {
    const res = await api.get(`/appraisals/manager/${managerId}/report/export`, {
        params: { cycleName },
        responseType: 'blob'
    })
    return res.data
}
export const acknowledgeAppraisal = async (appraisalId: number) => {
    const res = await api.patch(`/appraisals/${appraisalId}/acknowledge`);
    return res.data;
};