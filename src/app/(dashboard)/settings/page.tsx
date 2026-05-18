'use client';

import { useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useChangePassword, useSessions, useRevokeSession } from '@/hooks/useApi';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { clearAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import {
  Input,
  Button,
  Card,
  PageHeader,
  Badge,
  EmptyState,
  Skeleton,
  ConfirmDialog,
} from '@/components/ui';
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Monitor,
  Smartphone,
  Clock,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

function PasswordTab() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormData) => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset() }
    );
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="bg-primary-light flex items-center gap-3 rounded-lg p-4">
        <Shield size={16} className="text-primary shrink-0" />
        <p className="text-primary text-xs">
          Changing your password will not affect your active sessions. Use &ldquo;Sign out of all
          devices&rdquo; from Sessions to invalidate other sessions.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            leftIcon={<Lock size={14} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <Input
            label="New Password"
            type={showNew ? 'text' : 'password'}
            leftIcon={<Lock size={14} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            hint="Min. 8 chars with uppercase, number, and symbol"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            leftIcon={<Lock size={14} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" isLoading={isPending} size="lg" className="w-full">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}

function getDeviceIcon(userAgent?: string) {
  if (!userAgent) return Monitor;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return Smartphone;
  return Monitor;
}

function getDeviceName(userAgent?: string) {
  if (!userAgent) return 'Unknown device';
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  if (userAgent.includes('Edge')) return 'Edge Browser';
  return 'Browser';
}

function SessionsTab() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data, isLoading, refetch } = useSessions();
  const { mutate: revokeSession } = useRevokeSession();
  const sessions = data?.data || [];
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const { mutate: logoutAll, isPending: loggingOutAll } = useMutation({
    mutationFn: () => authApi.logout({ logoutAll: true }),
    onSuccess: () => {
      dispatch(clearAuth());
      toast.success('Logged out from all devices');
      router.push('/login');
    },
  });

  const { mutate: logoutCurrent, isPending: loggingOut } = useMutation({
    mutationFn: () => authApi.logout({}),
    onSuccess: () => {
      dispatch(clearAuth());
      toast.success('Logged out');
      router.push('/login');
    },
  });

  const handleRevoke = (id: string) => {
    setRevokingId(id);
    setConfirmRevoke(null);
    revokeSession(id, {
      onSuccess: () => {
        setRevokingId(null);
        refetch();
      },
      onError: () => setRevokingId(null),
    });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-danger-light border-danger/20 flex items-start gap-3 rounded-lg border p-4">
        <ShieldAlert size={16} className="text-danger mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-danger text-sm font-medium">Security concern?</p>
          <p className="text-danger/80 mt-0.5 mb-3 text-xs">
            If you notice an unfamiliar session, sign out from all devices immediately.
          </p>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<LogOut size={12} />}
            onClick={() => setConfirmSignOutAll(true)}
          >
            Sign out of all devices
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<Shield size={36} />}
          title="No active sessions"
          description="Your active login sessions will appear here."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session, i) => {
            const DeviceIcon = getDeviceIcon(session.userAgent);
            const isCurrent = i === 0;

            return (
              <Card key={session.id} className={isCurrent ? 'ring-primary/30 ring-1' : undefined}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isCurrent ? 'bg-primary-light' : 'bg-muted'}`}
                  >
                    <DeviceIcon
                      size={18}
                      className={isCurrent ? 'text-primary' : 'text-muted-foreground'}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground text-sm font-medium">
                        {getDeviceName(session.userAgent)}
                      </p>
                      {isCurrent && (
                        <Badge variant="primary" dot>
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3">
                      {session.ipAddress && (
                        <span className="text-muted-foreground text-xs">{session.ipAddress}</span>
                      )}
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(session.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {isCurrent ? (
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<LogOut size={12} />}
                      isLoading={loggingOut}
                      onClick={() => setConfirmSignOut(true)}
                    >
                      Sign out
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<LogOut size={12} />}
                      isLoading={revokingId === session.id}
                      onClick={() => setConfirmRevoke(session.id)}
                      className="text-danger hover:text-danger"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRevoke}
        onClose={() => setConfirmRevoke(null)}
        onConfirm={() => confirmRevoke && handleRevoke(confirmRevoke)}
        title="Revoke session"
        description="This will sign out the device associated with this session. Continue?"
        confirmLabel="Revoke"
        isLoading={!!revokingId}
      />
      <ConfirmDialog
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={() => {
          setConfirmSignOut(false);
          logoutCurrent();
        }}
        title="Sign out"
        description="You will be signed out of this device."
        confirmLabel="Sign out"
        isLoading={loggingOut}
      />
      <ConfirmDialog
        open={confirmSignOutAll}
        onClose={() => setConfirmSignOutAll(false)}
        onConfirm={() => {
          setConfirmSignOutAll(false);
          logoutAll();
        }}
        title="Sign out of all devices"
        description="This will revoke all active sessions including this one. You'll need to sign in again."
        confirmLabel="Sign out everywhere"
        isLoading={loggingOutAll}
      />
    </div>
  );
}

type Tab = 'password' | 'sessions';

const TABS: { id: Tab; label: string }[] = [
  { id: 'password', label: 'Change Password' },
  { id: 'sessions', label: 'Active Sessions' },
];

export default function SettingsPage() {
  useAuthGuard();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'password');

  const setTab = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Settings" description="Manage your account security and sessions" />

      <div className="bg-muted flex w-fit gap-1 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`transition-micro cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'password' && <PasswordTab />}
      {activeTab === 'sessions' && <SessionsTab />}
    </div>
  );
}
