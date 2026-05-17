import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsService } from '@/services/interviews.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { Interview } from '@/types/interview.types';
import toast from 'react-hot-toast';

export const useScheduleInterview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      applicationId: string;
      scheduledAt: string;
      durationMins?: number;
      mode?: string;
      meetLink?: string;
      notes?: string;
    }) => interviewsService.schedule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.interviews.all });
      toast.success('Interview scheduled');
    },
    onError: () => toast.error('Failed to schedule interview'),
  });
};

export const useUpdateInterview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Interview> }) =>
      interviewsService.update(id, data),
    onSuccess: (res, { id }) => {
      const updated = res.data.data as Interview;

      qc.setQueriesData(
        { queryKey: queryKeys.interviews.all },
        (old: ApiResponse<Interview[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((i) => (i.id === id ? { ...i, ...updated } : i)),
          };
        }
      );
      toast.success('Interview updated');
    },
  });
};

export const useRespondToInterview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      interviewsService.respond(id, status),
    onSuccess: (res, { id }) => {
      const updated = res.data.data as Interview;
      qc.setQueriesData(
        { queryKey: queryKeys.interviews.all },
        (old: ApiResponse<Interview[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((i) => (i.id === id ? { ...i, ...updated } : i)),
          };
        }
      );
      toast.success('Response submitted');
    },
  });
};
