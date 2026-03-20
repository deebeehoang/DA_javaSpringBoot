import axiosInstance from './axiosInstance';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export const authService = {
  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data),

  me: () =>
    axiosInstance.get<ApiResponse<User>>('/auth/me'),
};
