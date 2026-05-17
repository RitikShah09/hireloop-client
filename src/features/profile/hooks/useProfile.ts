import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';
import { queryKeys } from '@/lib/queryKeys';

export const useCandidateProfile = () =>
  useQuery({
    queryKey: queryKeys.profile.candidate,
    queryFn: () => profileService.getCandidate().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

export const useCompanyProfile = () =>
  useQuery({
    queryKey: queryKeys.profile.company,
    queryFn: () => profileService.getCompany().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
