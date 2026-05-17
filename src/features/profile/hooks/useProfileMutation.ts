import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ApiResponse } from '@/types/api.types';
import type { CandidateProfile, CompanyProfile } from '@/types/profile.types';
import toast from 'react-hot-toast';

export const useUpdateCandidateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CandidateProfile>) => profileService.updateCandidate(data),
    onSuccess: (res) => {
      const updated = res.data.data as CandidateProfile;
      qc.setQueryData(
        queryKeys.profile.candidate,
        (old: ApiResponse<CandidateProfile> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: { ...old.data, ...updated } };
        }
      );
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });
};

export const useUpdateCompanyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CompanyProfile>) => profileService.updateCompany(data),
    onSuccess: (res) => {
      const updated = res.data.data as CompanyProfile;
      qc.setQueryData(queryKeys.profile.company, (old: ApiResponse<CompanyProfile> | undefined) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, ...updated } };
      });
      toast.success('Company profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });
};
