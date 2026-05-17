import { useQuery } from '@tanstack/react-query';
import { interviewsService } from '@/services/interviews.service';
import { queryKeys } from '@/lib/queryKeys';

export const useInterviews = (params?: Record<string, string>) =>
  useQuery({
    queryKey: queryKeys.interviews.list(params),
    queryFn: () => interviewsService.getAll(params).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });
