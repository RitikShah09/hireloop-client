import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { Job } from '@/types/job.types';

export const jobsService = {
  list: (params?: Record<string, string>) => api.get<ApiResponse<Job[]>>('/jobs', { params }),

  getById: (id: string) => api.get<ApiResponse<Job>>(`/jobs/${id}`),

  getBySlug: (slug: string) => api.get<ApiResponse<Job>>(`/jobs/slug/${slug}`),

  getMine: (params?: Record<string, string>) =>
    api.get<ApiResponse<Job[]>>('/jobs/mine', { params }),

  create: (data: Partial<Job>) => api.post<ApiResponse<Job>>('/jobs', data),

  update: (id: string, data: Partial<Job>) => api.patch<ApiResponse<Job>>(`/jobs/${id}`, data),

  delete: (id: string) => api.delete(`/jobs/${id}`),
};
