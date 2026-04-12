import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types';

export const uploadService = {
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<ApiResponse<{ url: string }>>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadCV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<ApiResponse<{ url: string }>>('/upload/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<ApiResponse<{ url: string }>>('/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
