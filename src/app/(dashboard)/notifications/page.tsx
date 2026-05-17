'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  useInfiniteNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
} from '@/hooks/useApi';
import { Notification } from '@/services/api';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Briefcase,
  Calendar,
  Info,
  User,
  Loader2,
} from 'lucide-react';
import { Card, Button, Badge, PageHeader, EmptyState, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const categoryConfig: Record<
  string,
  {
    icon: React.ElementType;
    variant: 'primary' | 'success' | 'info' | 'warning' | 'neutral' | 'danger';
    label: string;
  }
> = {
  APPLICATION: { icon: Briefcase, variant: 'primary', label: 'Application' },
  INTERVIEW: { icon: Calendar, variant: 'success', label: 'Interview' },
  JOB: { icon: Briefcase, variant: 'info', label: 'Job' },
  PROFILE: { icon: User, variant: 'warning', label: 'Profile' },
  SYSTEM: { icon: Info, variant: 'neutral', label: 'System' },
};

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = categoryConfig[notification.category] ?? categoryConfig.SYSTEM;
  const Icon = config.icon;

  const startX = useRef<number | null>(null);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [swiped, setSwiped] = useState<'read' | 'delete' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const delta = e.touches[0].clientX - startX.current;
    setSwipeDelta(Math.max(-100, Math.min(80, delta)));
  };
  const handleTouchEnd = () => {
    if (swipeDelta < -70) {
      setSwiped('delete');
      setTimeout(() => onDelete(notification.id), 300);
    } else if (swipeDelta > 60 && !notification.isRead) {
      setSwiped('read');
      setTimeout(() => onRead(notification.id), 300);
    }
    setSwipeDelta(0);
    startX.current = null;
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="bg-success-light pointer-events-none absolute inset-y-0 left-0 flex w-20 items-center justify-center"
        style={{ opacity: swipeDelta > 30 ? 0.9 : 0 }}
      >
        <Check size={18} className="text-success" />
      </div>
      <div
        className="bg-danger-light pointer-events-none absolute inset-y-0 right-0 flex w-20 items-center justify-center"
        style={{ opacity: swipeDelta < -30 ? 0.9 : 0 }}
      >
        <Trash2 size={18} className="text-danger" />
      </div>

      <div
        className={cn(
          'flex items-start gap-3 px-4 py-3 transition-all',
          !notification.isRead && 'bg-primary-light/40',
          swiped === 'read' && 'translate-x-full opacity-0',
          swiped === 'delete' && '-translate-x-full opacity-0'
        )}
        style={{
          transform: swipeDelta !== 0 ? `translateX(${swipeDelta}px)` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            `bg-${config.variant === 'primary' ? 'primary' : config.variant}-light`
          )}
        >
          <Icon size={14} className={`text-${config.variant}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm leading-snug',
                !notification.isRead ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {notification.title}
            </p>
            <span className="text-muted-foreground mt-0.5 text-[10px] whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{notification.body}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant={config.variant} className="text-[10px]">
              {config.label}
            </Badge>
            {!notification.isRead && <span className="bg-primary h-1.5 w-1.5 rounded-full" />}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!notification.isRead && (
            <button
              onClick={() => onRead(notification.id)}
              className="hover:bg-success-light text-muted-foreground hover:text-success cursor-pointer rounded p-1 transition-colors"
              title="Mark as read"
            >
              <Check size={13} />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="hover:bg-danger-light text-muted-foreground hover:text-danger cursor-pointer rounded p-1 transition-colors"
            title="Delete"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  useAuthGuard();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const params = filter === 'unread' ? { unreadOnly: 'true' } : undefined;
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteNotifications(params);

  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();
  const { mutate: deleteOne } = useDeleteNotification();
  const { mutate: deleteRead, isPending: deletingRead } = useDeleteReadNotifications();

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchNext = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNext();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNext]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const es = new EventSource(`${apiUrl}/notifications/stream`, {
      withCredentials: true,
    });
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'notification') refetch();
      } catch {}
    };
    return () => es.close();
  }, [refetch]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<CheckCheck size={13} />}
                onClick={() => markAll()}
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={13} />}
              onClick={() => deleteRead()}
              isLoading={deletingRead}
              className="text-danger"
            >
              Clear read
            </Button>
          </div>
        }
      />

      <div className="bg-muted flex w-fit gap-0.5 rounded-lg p-1">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'transition-micro cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium capitalize',
              filter === f
                ? 'bg-surface text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card divide-border divide-y overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={36} />}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description="You'll receive updates about applications, interviews, and more here."
        />
      ) : (
        <>
          <Card padding="none" className="divide-border divide-y overflow-hidden">
            {notifications.map((n) => (
              <div key={n.id} className="group">
                <NotificationItem
                  notification={n}
                  onRead={(id) => markRead(id)}
                  onDelete={(id) => deleteOne(id)}
                />
              </div>
            ))}
          </Card>

          <div ref={sentinelRef} className="flex justify-center py-2">
            {isFetchingNextPage && (
              <Loader2 size={20} className="text-muted-foreground animate-spin" />
            )}
            {!hasNextPage && notifications.length > 0 && (
              <p className="text-muted-foreground text-xs">All notifications loaded</p>
            )}
          </div>
        </>
      )}

      <p className="text-muted-foreground text-center text-xs">
        Swipe right to mark as read · Swipe left to delete
      </p>
    </div>
  );
}
