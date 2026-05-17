import { useQuery } from '@tanstack/react-query';
import { applicationsService } from '@/services/applications.service';
import { queryKeys } from '@/lib/queryKeys';

export const useApplications = (params?: Record<string, string>) =>
  useQuery({
    queryKey: queryKeys.applications.list(params),
    queryFn: () => applicationsService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 30,
    enabled: params !== undefined,
  });

export const useCandidateApplications = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.applications.list({}),
    queryFn: () => applicationsService.getAll({}).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    enabled,
  });

export const useApplicationStats = () =>
  useQuery({
    queryKey: queryKeys.applications.stats,
    queryFn: () => applicationsService.getStats().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });
