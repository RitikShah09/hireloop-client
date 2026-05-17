import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { queryKeys } from '@/lib/queryKeys';

export const useSessions = () =>
  useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => authService.getSessions().then((r) => r.data),
    staleTime: 1000 * 30,
  });
