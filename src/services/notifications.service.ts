import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { Notification } from '@/types/notification.types';

export const notificationsService = {
  getAll: (params?: { page?: string; limit?: string; unreadOnly?: string }) =>
    api.get<ApiResponse<Notification[]> & { unreadCount: number }>('/notifications', { params }),

  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/mark-all-read'),

  deleteOne: (id: string) => api.delete(`/notifications/${id}`),

  deleteRead: () => api.delete('/notifications/read'),
};
