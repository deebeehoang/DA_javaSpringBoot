import axiosInstance from './axiosInstance';
import type { ApiResponse, CandidateProfile, CandidateProfileRequest, EmployerProfile, EmployerProfileRequest } from '@/types';

export const profileService = {
  // Candidate
  getCandidateProfile: () =>
    axiosInstance.get<ApiResponse<CandidateProfile>>('/candidates/profile'),

  updateCandidateProfile: (data: CandidateProfileRequest) =>
    axiosInstance.put<ApiResponse<CandidateProfile>>('/candidates/profile', data),

  // Employer
  getEmployerProfile: () =>
    axiosInstance.get<ApiResponse<EmployerProfile>>('/employers/profile'),

  updateEmployerProfile: (data: EmployerProfileRequest) =>
    axiosInstance.put<ApiResponse<EmployerProfile>>('/employers/profile', data),

  // Employer chart stats
  getEmployerChartStats: () =>
    axiosInstance.get<ApiResponse<any>>('/employers/stats/chart'),
};
