import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { Interview } from '@/types/interview.types';

export const interviewsService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<Interview[]>>('/interviews', { params }),

  schedule: (data: {
    applicationId: string;
    scheduledAt: string;
    durationMins?: number;
    mode?: string;
    meetLink?: string;
    notes?: string;
  }) => api.post<ApiResponse<Interview>>('/interviews', data),

  update: (id: string, data: Partial<Interview>) =>
    api.patch<ApiResponse<Interview>>(`/interviews/${id}`, data),

  respond: (id: string, status: 'ACCEPTED' | 'REJECTED') =>
    api.patch(`/interviews/${id}/respond`, { status }),
};
