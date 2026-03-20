import axiosInstance from './axiosInstance';
import type { ApiResponse, Notification } from '@/types';

export const notificationService = {
  getAll: () => axiosInstance.get<ApiResponse<Notification[]>>('/notifications'),

  unreadCount: () => axiosInstance.get<ApiResponse<number>>('/notifications/unread-count'),

  markAsRead: (id: number) => axiosInstance.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),
};
