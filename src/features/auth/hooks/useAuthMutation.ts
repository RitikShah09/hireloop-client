import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { Session } from '@/types/auth.types';
import toast from 'react-hot-toast';

export const useRevokeSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: (_, sessionId) => {
      qc.setQueryData(queryKeys.sessions, (old: ApiResponse<Session[]> | undefined) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((s) => s.id !== sessionId) };
      });
      toast.success('Session revoked');
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message || 'Failed to change password'),
  });
