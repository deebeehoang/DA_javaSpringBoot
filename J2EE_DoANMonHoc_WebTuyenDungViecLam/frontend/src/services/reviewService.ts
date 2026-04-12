import axiosInstance from './axiosInstance';
import type { ApiResponse, Review, ReviewRequest, EmployerRating } from '@/types';

export const reviewService = {
  create: (data: ReviewRequest) =>
    axiosInstance.post<ApiResponse<Review>>('/reviews', data),

  checkReviewed: (jobId: number) =>
    axiosInstance.get<ApiResponse<boolean>>(`/reviews/check/${jobId}`),

  getByEmployer: (employerId: number, page = 0, size = 10) =>
    axiosInstance.get<ApiResponse<Review[]>>(`/reviews/employer/${employerId}`, {
      params: { page, size },
    }),

  getEmployerRating: (employerId: number) =>
    axiosInstance.get<ApiResponse<EmployerRating>>(`/reviews/employer/${employerId}/rating`),
};
