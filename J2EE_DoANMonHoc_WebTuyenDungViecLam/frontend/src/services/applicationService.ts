import axiosInstance from './axiosInstance';
import type { ApiResponse, Application, ApplicationRequest } from '@/types';

export const applicationService = {
  apply: (data: ApplicationRequest) =>
    axiosInstance.post<ApiResponse<Application>>('/applications', data),

  checkApplied: (jobId: number) =>
    axiosInstance.get<ApiResponse<boolean>>(`/applications/check/${jobId}`),

  myApplications: () =>
    axiosInstance.get<ApiResponse<Application[]>>('/applications/my'),

  byJob: (jobId: number) =>
    axiosInstance.get<ApiResponse<Application[]>>(`/applications/job/${jobId}`),

  byEmployer: () =>
    axiosInstance.get<ApiResponse<Application[]>>('/applications/employer'),

  updateStatus: (id: number, status: string) =>
    axiosInstance.patch<ApiResponse<Application>>(`/applications/${id}/status`, { status }),

  markCvViewed: (id: number) =>
    axiosInstance.patch<ApiResponse<Application>>(`/applications/${id}/view`),

  withdraw: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/applications/${id}`),
};
