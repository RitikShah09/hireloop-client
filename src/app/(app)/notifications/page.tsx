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

  const SNAP = 80;
  const THRESH = 55;

  const startXRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [delta, setDelta] = useState(0);
  const [snapped, setSnapped] = useState<'read' | 'delete' | null>(null);
  const [deleting, setDeleting] = useState(false);

  const snapPos = snapped === 'read' ? SNAP : snapped === 'delete' ? -SNAP : 0;
  const cardX = isDragging ? Math.max(-SNAP - 15, Math.min(SNAP + 15, snapPos + delta)) : snapPos;

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
    setDelta(0);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    setDelta(e.touches[0].clientX - startXRef.current);
  };
  const onTouchEnd = () => {
    const eff = Math.max(-SNAP - 15, Math.min(SNAP + 15, snapPos + delta));
    startXRef.current = null;
    setIsDragging(false);
    if (eff > THRESH && !notification.isRead) setSnapped('read');
    else if (eff < -THRESH) setSnapped('delete');
    else setSnapped(null);
    setDelta(0);
  };
  const confirmRead = () => {
    setSnapped(null);
    onRead(notification.id);
  };
  const confirmDelete = () => {
    setDeleting(true);
    setTimeout(() => onDelete(notification.id), 320);
  };

  const showReadZone = cardX > 10;
  const showDeleteZone = cardX < -10;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: deleting ? '0fr' : '1fr',
        opacity: deleting ? 0 : 1,
        transition: deleting ? 'grid-template-rows 0.3s ease, opacity 0.25s ease' : undefined,
        overflow: 'hidden',
      }}
    >
      <div className="relative overflow-hidden" style={{ overflow: 'hidden' }}>
        <div
          className="bg-success-light absolute inset-y-0 left-0 flex w-20 flex-col items-center justify-center gap-0.5"
          style={{
            opacity: showReadZone ? Math.min(1, cardX / SNAP) : 0,
            cursor: snapped === 'read' ? 'pointer' : 'default',
            pointerEvents: snapped === 'read' ? 'auto' : 'none',
          }}
          onClick={confirmRead}
        >
          <Check size={18} className="text-success" />
          {snapped === 'read' && (
            <span className="text-success text-[10px] font-semibold">Tap</span>
          )}
        </div>

        <div
          className="bg-danger-light absolute inset-y-0 right-0 flex w-20 flex-col items-center justify-center gap-0.5"
          style={{
            opacity: showDeleteZone ? Math.min(1, -cardX / SNAP) : 0,
            cursor: snapped === 'delete' ? 'pointer' : 'default',
            pointerEvents: snapped === 'delete' ? 'auto' : 'none',
          }}
          onClick={confirmDelete}
        >
          <Trash2 size={18} className="text-danger" />
          {snapped === 'delete' && (
            <span className="text-danger text-[10px] font-semibold">Tap</span>
          )}
        </div>

        <div
          className={cn(
            'flex items-start gap-3 px-4 py-3',
            !notification.isRead && 'bg-primary-light/40'
          )}
          style={{
            transform: `translateX(${cardX}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            cursor: snapped ? 'pointer' : 'default',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={snapped ? () => setSnapped(null) : undefined}
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
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
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

          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRead(notification.id);
                }}
                className="hover:bg-success-light text-muted-foreground hover:text-success cursor-pointer rounded p-1 transition-colors"
                title="Mark as read"
              >
                <Check size={13} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete();
              }}
              className="hover:bg-danger-light text-muted-foreground hover:text-danger cursor-pointer rounded p-1 transition-colors"
              title="Delete"
            >
              <X size={13} />
            </button>
          </div>
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
        Swipe to reveal action · Tap the colour to confirm
      </p>
    </div>
  );
}
