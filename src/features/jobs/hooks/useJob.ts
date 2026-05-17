import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { candidateService } from '@/services/candidate.service';
import { queryKeys } from '@/lib/queryKeys';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const useJobs = (params?: Record<string, string>) =>
  useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => jobsService.list(params).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useJob = (idOrSlug: string) =>
  useQuery({
    queryKey: queryKeys.jobs.detail(idOrSlug),
    queryFn: () => {
      const fn = UUID_RE.test(idOrSlug) ? jobsService.getById : jobsService.getBySlug;
      return fn(idOrSlug).then((r) => r.data);
    },
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 5,
  });

export const useMyJobs = (params?: Record<string, string>) =>
  useQuery({
    queryKey: queryKeys.jobs.mine(params),
    queryFn: () => jobsService.getMine(params).then((r) => r.data),
    staleTime: 1000 * 30,
  });

export const useSuggestedJobs = () =>
  useQuery({
    queryKey: queryKeys.jobs.suggested,
    queryFn: () => candidateService.getSuggestedJobs().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
