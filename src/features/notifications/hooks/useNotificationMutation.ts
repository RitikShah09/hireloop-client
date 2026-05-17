import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { Notification } from '@/types/notification.types';
import type { NotifPage } from './useNotification';
import toast from 'react-hot-toast';

type NotifListCache = { notifications?: Notification[]; unreadCount?: number };
type NotifInfiniteCache = { pages: NotifPage[]; pageParams: unknown[] };

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: (_, id) => {
      qc.setQueriesData(
        { queryKey: queryKeys.notifications.all },
        (old: NotifListCache | undefined) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            unreadCount: Math.max(0, (old.unreadCount ?? 1) - 1),
          };
        }
      );
      qc.setQueriesData(
        { queryKey: ['notifications', 'infinite'] },
        (old: NotifInfiniteCache | undefined) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              ),
              unreadCount: Math.max(0, page.unreadCount - 1),
            })),
          };
        }
      );
      qc.setQueryData(
        queryKeys.notifications.count,
        (old: ApiResponse<{ count: number }> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: { count: Math.max(0, old.data.count - 1) } };
        }
      );
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      qc.setQueriesData(
        { queryKey: queryKeys.notifications.all },
        (old: NotifListCache | undefined) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => ({
              ...n,
              isRead: true,
            })),
            unreadCount: 0,
          };
        }
      );
      qc.setQueriesData(
        { queryKey: ['notifications', 'infinite'] },
        (old: NotifInfiniteCache | undefined) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((n) => ({
                ...n,
                isRead: true,
              })),
              unreadCount: 0,
            })),
          };
        }
      );
      qc.setQueryData(
        queryKeys.notifications.count,
        (old: ApiResponse<{ count: number }> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: { count: 0 } };
        }
      );
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteOne(id),
    onSuccess: (_, id) => {
      qc.setQueriesData(
        { queryKey: queryKeys.notifications.all },
        (old: NotifListCache | undefined) => {
          if (!old?.notifications) return old;
          const removed = old.notifications.find((n) => n.id === id);
          return {
            ...old,
            notifications: old.notifications.filter((n) => n.id !== id),
            unreadCount:
              removed && !removed.isRead
                ? Math.max(0, (old.unreadCount ?? 1) - 1)
                : old.unreadCount,
          };
        }
      );
      qc.setQueriesData(
        { queryKey: ['notifications', 'infinite'] },
        (old: NotifInfiniteCache | undefined) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => {
              const removed = page.notifications.find((n) => n.id === id);
              return {
                ...page,
                notifications: page.notifications.filter((n) => n.id !== id),
                unreadCount:
                  removed && !removed.isRead ? Math.max(0, page.unreadCount - 1) : page.unreadCount,
              };
            }),
          };
        }
      );
      qc.invalidateQueries({ queryKey: queryKeys.notifications.count });
    },
  });
};

export const useDeleteReadNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.deleteRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success('Cleared read notifications');
    },
  });
};
