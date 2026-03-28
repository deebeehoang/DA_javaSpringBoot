import axiosInstance from './axiosInstance';
import type { ApiResponse, Job } from '@/types';

export interface CandidateSkill {
  skillId: number;
  skillName: string;
  category: string;
  level: string;
}

export interface SkillOption {
  id: number;
  name: string;
  category: string;
}

export interface CandidateStats {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  savedJobs: number;
  skills: number;
}

export const candidateService = {
  // Skills
  getMySkills: () =>
    axiosInstance.get<ApiResponse<CandidateSkill[]>>('/candidates/skills'),

  getAllSkills: () =>
    axiosInstance.get<ApiResponse<SkillOption[]>>('/candidates/skills/all'),

  addSkill: (skillId: number, level: string) =>
    axiosInstance.post<ApiResponse<string>>('/candidates/skills', { skillId, level }),

  updateSkillLevel: (skillId: number, level: string) =>
    axiosInstance.put<ApiResponse<string>>(`/candidates/skills/${skillId}`, { level }),

  removeSkill: (skillId: number) =>
    axiosInstance.delete<ApiResponse<string>>(`/candidates/skills/${skillId}`),

  // Saved Jobs
  getSavedJobs: () =>
    axiosInstance.get<ApiResponse<Job[]>>('/candidates/saved-jobs'),

  saveJob: (jobId: number) =>
    axiosInstance.post<ApiResponse<string>>(`/candidates/saved-jobs/${jobId}`),

  unsaveJob: (jobId: number) =>
    axiosInstance.delete<ApiResponse<string>>(`/candidates/saved-jobs/${jobId}`),

  checkSaved: (jobId: number) =>
    axiosInstance.get<ApiResponse<boolean>>(`/candidates/saved-jobs/${jobId}/check`),

  // Stats
  getStats: () =>
    axiosInstance.get<ApiResponse<CandidateStats>>('/candidates/stats'),
};
