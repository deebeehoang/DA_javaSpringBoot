import axiosInstance from './axiosInstance';
import type { ApiResponse, Category, Job, User } from '@/types';

export interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalCandidates: number;
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  totalCategories: number;
}

export interface CategoryRequest {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export const adminService = {
  // Stats
  getStats: () =>
    axiosInstance.get<ApiResponse<DashboardStats>>('/admin/stats'),

  // Users
  getUsers: (page = 0, size = 10, role?: string) =>
    axiosInstance.get<ApiResponse<any>>('/admin/users', { params: { page, size, role: role || undefined } }),

  updateUserStatus: (id: number, status: string) =>
    axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { status }),

  deleteUser: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/admin/users/${id}`),

  // Jobs
  getJobs: (page = 0, size = 10, status?: string) =>
    axiosInstance.get<ApiResponse<any>>('/admin/jobs', { params: { page, size, status: status || undefined } }),

  updateJobStatus: (id: number, status: string) =>
    axiosInstance.patch<ApiResponse<Job>>(`/admin/jobs/${id}/status`, { status }),

  deleteJob: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/admin/jobs/${id}`),

  // Categories
  getCategories: () =>
    axiosInstance.get<ApiResponse<Category[]>>('/admin/categories'),

  createCategory: (data: CategoryRequest) =>
    axiosInstance.post<ApiResponse<Category>>('/admin/categories', data),

  updateCategory: (id: number, data: CategoryRequest) =>
    axiosInstance.put<ApiResponse<Category>>(`/admin/categories/${id}`, data),

  toggleCategory: (id: number) =>
    axiosInstance.patch<ApiResponse<Category>>(`/admin/categories/${id}/toggle`),

  deleteCategory: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/admin/categories/${id}`),
};
