import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { queryKeys } from '@/lib/queryKeys';
import type { Notification } from '@/types/notification.types';

export type NotifPage = {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export const useNotifications = (params?: Record<string, string>) =>
  useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsService.getAll(params).then((r) => r.data),
    staleTime: 0,
    refetchInterval: 60000,
  });

export const useInfiniteNotifications = (params?: Record<string, string>) =>
  useInfiniteQuery({
    queryKey: queryKeys.notifications.infinite(params),

    queryFn: ({ pageParam }): Promise<NotifPage> =>
      notificationsService
        .getAll({ ...params, page: String(pageParam), limit: '20' })
        .then((r) => r.data as unknown as NotifPage),
    getNextPageParam: (lastPage: NotifPage) =>
      lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 0,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: queryKeys.notifications.count,
    queryFn: () => notificationsService.getUnreadCount().then((r) => r.data),
    refetchInterval: 30000,
    staleTime: 0,
  });
