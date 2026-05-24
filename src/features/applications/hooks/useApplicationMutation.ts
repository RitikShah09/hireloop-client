import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/services/applications.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { Application, Stats } from '@/types/application.types';
import toast from 'react-hot-toast';

export const useApplyToJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { jobId: string; resumeId: string; coverLetter?: string }) =>
      applicationsService.apply(data),
    onSuccess: (res) => {
      const newApp = res.data.data as Application;
      if (newApp) {
        qc.setQueryData(
          queryKeys.applications.list({}),
          (old: ApiResponse<Application[]> | undefined) => {
            if (!old?.data) return old;
            return { ...old, data: [newApp, ...old.data] };
          }
        );
      }

      qc.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (key[0] !== 'applications' || key[1] !== 'list') return false;
          const params = key[2] as Record<string, string> | undefined;
          return params !== undefined && 'page' in params;
        },
      });

      qc.setQueryData(queryKeys.applications.stats, (old: ApiResponse<Stats> | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, total: old.data.total + 1, pending: (old.data.pending ?? 0) + 1 },
        };
      });
      toast.success('Application submitted — AI screening in progress');
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message || 'Failed to apply'),
  });
};

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationsService.updateStatus(id, status),
    onSuccess: (res, { id, status: newStatus }) => {
      const updatedApp = res.data.data as Application;

      let oldStatus: string | undefined;
      const allLists = qc.getQueriesData<ApiResponse<Application[]>>({
        queryKey: ['applications', 'list'],
      });
      for (const [, listData] of allLists) {
        const found = listData?.data?.find((a) => a.id === id);
        if (found) {
          oldStatus = found.status;
          break;
        }
      }

      qc.setQueriesData(
        { queryKey: ['applications', 'list'] },
        (old: ApiResponse<Application[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: newStatus,
                    updatedAt: updatedApp?.updatedAt ?? new Date().toISOString(),
                  }
                : a
            ),
          };
        }
      );

      if (oldStatus && oldStatus !== newStatus) {
        qc.setQueryData(queryKeys.applications.stats, (old: ApiResponse<Stats> | undefined) => {
          if (!old?.data) return old;
          const stats = { ...old.data } as Record<string, number>;
          const oldKey = oldStatus!.toLowerCase();
          const newKey = newStatus.toLowerCase();
          if (typeof stats[oldKey] === 'number') stats[oldKey] = Math.max(0, stats[oldKey] - 1);
          if (typeof stats[newKey] === 'number') stats[newKey] += 1;
          return { ...old, data: stats as unknown as Stats };
        });
      }

      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });
};

export const useChatWithPool = () =>
  useMutation({
    mutationFn: ({ jobId, query }: { jobId: string; query: string }) =>
      applicationsService.chat(jobId, query),
  });
