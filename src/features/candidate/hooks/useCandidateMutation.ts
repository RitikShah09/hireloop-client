import { useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '@/services/candidate.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { Certification, WorkExperience, Education, Milestone } from '@/types/candidate.types';
import toast from 'react-hot-toast';

export const useAddCertification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Certification>) => candidateService.addCertification(data),
    onSuccess: (res) => {
      const newItem = res.data.data as Certification;
      qc.setQueryData(
        queryKeys.candidate.certifications,
        (old: ApiResponse<Certification[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: [...old.data, newItem] };
        }
      );
      toast.success('Certification added');
    },
  });
};

export const useUpdateCertification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Certification> }) =>
      candidateService.updateCertification(id, data),
    onSuccess: (res) => {
      const updated = res.data.data as Certification;
      qc.setQueryData(
        queryKeys.candidate.certifications,
        (old: ApiResponse<Certification[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c) => (c.id === updated.id ? updated : c)),
          };
        }
      );
    },
  });
};

export const useDeleteCertification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => candidateService.deleteCertification(id),
    onSuccess: (_, id) => {
      qc.setQueryData(
        queryKeys.candidate.certifications,
        (old: ApiResponse<Certification[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((c) => c.id !== id) };
        }
      );
      toast.success('Certification removed');
    },
  });
};

export const useAddExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkExperience>) => candidateService.addExperience(data),
    onSuccess: (res) => {
      const newItem = res.data.data as WorkExperience;
      qc.setQueryData(
        queryKeys.candidate.experience,
        (old: ApiResponse<WorkExperience[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: [newItem, ...old.data] };
        }
      );
      toast.success('Experience added');
    },
  });
};

export const useUpdateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkExperience> }) =>
      candidateService.updateExperience(id, data),
    onSuccess: (res) => {
      const updated = res.data.data as WorkExperience;
      qc.setQueryData(
        queryKeys.candidate.experience,
        (old: ApiResponse<WorkExperience[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((e) => (e.id === updated.id ? updated : e)),
          };
        }
      );
    },
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => candidateService.deleteExperience(id),
    onSuccess: (_, id) => {
      qc.setQueryData(
        queryKeys.candidate.experience,
        (old: ApiResponse<WorkExperience[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((e) => e.id !== id) };
        }
      );
      toast.success('Experience removed');
    },
  });
};

export const useAddEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Education>) => candidateService.addEducation(data),
    onSuccess: (res) => {
      const newItem = res.data.data as Education;
      qc.setQueryData(
        queryKeys.candidate.education,
        (old: ApiResponse<Education[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: [...old.data, newItem] };
        }
      );
      toast.success('Education added');
    },
  });
};

export const useUpdateEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Education> }) =>
      candidateService.updateEducation(id, data),
    onSuccess: (res) => {
      const updated = res.data.data as Education;
      qc.setQueryData(
        queryKeys.candidate.education,
        (old: ApiResponse<Education[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((e) => (e.id === updated.id ? updated : e)),
          };
        }
      );
    },
  });
};

export const useDeleteEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => candidateService.deleteEducation(id),
    onSuccess: (_, id) => {
      qc.setQueryData(
        queryKeys.candidate.education,
        (old: ApiResponse<Education[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((e) => e.id !== id) };
        }
      );
      toast.success('Education removed');
    },
  });
};

export const useAddMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Milestone>) => candidateService.addMilestone(data),
    onSuccess: (res) => {
      const newItem = res.data.data as Milestone;
      qc.setQueryData(
        queryKeys.candidate.milestones,
        (old: ApiResponse<Milestone[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: [...old.data, newItem] };
        }
      );
      toast.success('Milestone added');
    },
  });
};

export const useUpdateMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Milestone> }) =>
      candidateService.updateMilestone(id, data),
    onSuccess: (res) => {
      const updated = res.data.data as Milestone;
      qc.setQueryData(
        queryKeys.candidate.milestones,
        (old: ApiResponse<Milestone[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((m) => (m.id === updated.id ? updated : m)),
          };
        }
      );
    },
  });
};

export const useDeleteMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => candidateService.deleteMilestone(id),
    onSuccess: (_, id) => {
      qc.setQueryData(
        queryKeys.candidate.milestones,
        (old: ApiResponse<Milestone[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((m) => m.id !== id) };
        }
      );
      toast.success('Milestone removed');
    },
  });
};
