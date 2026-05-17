import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { LoginPayload, RegisterPayload, AuthUser, Session } from '@/types/auth.types';

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<ApiResponse<{ user: AuthUser }>>('/auth/register', data),

  login: (data: LoginPayload) => api.post<ApiResponse<{ user: AuthUser }>>('/auth/login', data),

  logout: (data?: { logoutAll?: boolean }) => api.post('/auth/logout', data || {}),

  refresh: () => api.post<ApiResponse<{ user: AuthUser }>>('/auth/refresh'),

  me: () => api.get<ApiResponse<AuthUser>>('/auth/me'),

  getSessions: () => api.get<ApiResponse<Session[]>>('/auth/sessions'),

  revokeSession: (sessionId: string) => api.delete(`/auth/sessions/${sessionId}`),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};
