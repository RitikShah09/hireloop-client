import { useQuery } from '@tanstack/react-query';
import { candidateService } from '@/services/candidate.service';
import { queryKeys } from '@/lib/queryKeys';

export const useCertifications = () =>
  useQuery({
    queryKey: queryKeys.candidate.certifications,
    queryFn: () => candidateService.getCertifications().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

export const useWorkExperience = () =>
  useQuery({
    queryKey: queryKeys.candidate.experience,
    queryFn: () => candidateService.getExperience().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

export const useEducation = () =>
  useQuery({
    queryKey: queryKeys.candidate.education,
    queryFn: () => candidateService.getEducation().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

export const useMilestones = () =>
  useQuery({
    queryKey: queryKeys.candidate.milestones,
    queryFn: () => candidateService.getMilestones().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
