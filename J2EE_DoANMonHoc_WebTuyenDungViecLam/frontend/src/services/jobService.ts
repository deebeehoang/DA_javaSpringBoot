import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  Job,
  JobCreateRequest,
  JobSearchParams,
  JobUpdateRequest,
} from '@/types';

export const jobService = {
  search: (params: JobSearchParams) =>
    axiosInstance.get<ApiResponse<Job[]>>('/jobs', { params }),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<Job>>(`/jobs/${id}`),

  create: (data: JobCreateRequest) =>
    axiosInstance.post<ApiResponse<Job>>('/jobs', data),

  update: (id: number, data: JobUpdateRequest) =>
    axiosInstance.put<ApiResponse<Job>>(`/jobs/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/jobs/${id}`),

  myJobs: () =>
    axiosInstance.get<ApiResponse<Job[]>>('/jobs/my'),

  updateStatus: (id: number, status: string) =>
    axiosInstance.patch<ApiResponse<Job>>(`/jobs/${id}/status`, { status }),

  updateMyJobStatus: (id: number, status: string) =>
    axiosInstance.patch<ApiResponse<Job>>(`/jobs/my/${id}/status`, { status }),
};
