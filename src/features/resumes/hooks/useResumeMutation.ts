import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumesService } from '@/services/resumes.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { Resume } from '@/types/resume.types';
import toast from 'react-hot-toast';

export const useUploadResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => resumesService.upload(file),
    onSuccess: (res) => {
      const newResume = res.data.data as Resume;
      qc.setQueryData(queryKeys.resumes.all, (old: ApiResponse<Resume[]> | undefined) => {
        if (!old?.data) return old;
        return { ...old, data: [newResume, ...old.data] };
      });
      toast.success('Resume uploaded');
    },
    onError: () => toast.error('Failed to upload resume'),
  });
};

export const useDeleteResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumesService.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData(queryKeys.resumes.all, (old: ApiResponse<Resume[]> | undefined) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((r) => r.id !== id) };
      });
      toast.success('Resume deleted');
    },
  });
};

export const useSetDefaultResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumesService.setDefault(id),
    onSuccess: (_, id) => {
      qc.setQueryData(queryKeys.resumes.all, (old: ApiResponse<Resume[]> | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((r) => ({ ...r, isDefault: r.id === id })),
        };
      });
    },
  });
};
