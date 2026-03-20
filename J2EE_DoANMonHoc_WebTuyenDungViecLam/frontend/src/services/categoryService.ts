import axiosInstance from './axiosInstance';
import type { ApiResponse, Category } from '@/types';

export const categoryService = {
  getAll: () =>
    axiosInstance.get<ApiResponse<Category[]>>('/categories'),
};
