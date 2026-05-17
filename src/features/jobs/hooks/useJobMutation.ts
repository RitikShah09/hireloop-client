import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { Job } from '@/types/job.types';
import toast from 'react-hot-toast';

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Job>) => jobsService.create(data),
    onSuccess: (res) => {
      const newJob = res.data.data as Job;
      if (newJob) {
        qc.setQueryData(
          queryKeys.jobs.mine({ page: '1' }),
          (old: ApiResponse<Job[]> | undefined) => {
            if (!old?.data) return old;
            const limit = old.meta?.limit ?? 10;
            return {
              ...old,
              data: [newJob, ...old.data].slice(0, limit),
              meta: old.meta ? { ...old.meta, total: old.meta.total + 1 } : old.meta,
            };
          }
        );
      }
      qc.invalidateQueries({ queryKey: ['jobs', 'list'] });
      toast.success('Job created successfully');
    },
    onError: () => toast.error('Failed to create job'),
  });
};

export const useUpdateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) => jobsService.update(id, data),
    onSuccess: (res, { id }) => {
      const updatedJob = res.data.data as Job;
      const applyUpdate = (old: ApiResponse<Job[]> | undefined) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((j) => (j.id === id ? { ...j, ...updatedJob } : j)) };
      };
      qc.setQueriesData({ queryKey: ['jobs', 'mine'] }, applyUpdate);
      qc.setQueriesData({ queryKey: ['jobs', 'list'] }, applyUpdate);
      qc.setQueryData(queryKeys.jobs.detail(id), (old: ApiResponse<Job> | undefined) =>
        old?.data ? { ...old, data: { ...old.data, ...updatedJob } } : old
      );
      toast.success('Job updated');
    },
    onError: () => toast.error('Failed to update job'),
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsService.delete(id),
    onSuccess: (_, id) => {
      const applyRemove = (old: ApiResponse<Job[]> | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((j) => j.id !== id),
          meta: old.meta ? { ...old.meta, total: Math.max(0, old.meta.total - 1) } : old.meta,
        };
      };
      qc.setQueriesData({ queryKey: ['jobs', 'mine'] }, applyRemove);
      qc.setQueriesData({ queryKey: ['jobs', 'list'] }, applyRemove);
      qc.removeQueries({ queryKey: queryKeys.jobs.detail(id) });
      toast.success('Job deleted');
    },
    onError: () => toast.error('Failed to delete job'),
  });
};
