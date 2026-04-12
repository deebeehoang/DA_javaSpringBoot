import axiosInstance from './axiosInstance';
import type { ApiResponse, AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, User } from '@/types';

export const authService = {
  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data),

  me: () =>
    axiosInstance.get<ApiResponse<User>>('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    axiosInstance.put<ApiResponse<string>>('/auth/change-password', data),
};
