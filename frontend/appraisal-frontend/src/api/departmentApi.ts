import api from "./axios";
import type {
  DepartmentRequestDTO,
  DepartmentResponseDTO,
} from "../types";

export const getDepartments = async (): Promise<DepartmentResponseDTO[]> => {
  const response = await api.get("/departments");
  return response.data;
};

export const createDepartment = async (
  data: DepartmentRequestDTO
): Promise<DepartmentResponseDTO> => {
  const response = await api.post("/departments", data);
  return response.data;
};

export const updateDepartment = async (
  id: number,
  data: DepartmentRequestDTO
): Promise<DepartmentResponseDTO> => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await api.delete(`/departments/${id}`);
};