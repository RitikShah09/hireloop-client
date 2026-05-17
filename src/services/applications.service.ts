import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { Application, Stats } from '@/types/application.types';

export const applicationsService = {
  apply: (data: { jobId: string; resumeId: string; coverLetter?: string }) =>
    api.post<ApiResponse<{ id: string }>>('/applications', data),

  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<Application[]>>('/applications', { params }),

  getStats: () => api.get<ApiResponse<Stats>>('/applications/stats'),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Application>>(`/applications/${id}/status`, {
      status,
    }),

  chat: (jobId: string, query: string) =>
    api.post<ApiResponse<{ answer: string }>>('/applications/chat', {
      jobId,
      query,
    }),

  semanticSearch: (jobId: string) =>
    api.get<ApiResponse<unknown[]>>(`/applications/semantic/${jobId}`),
};
