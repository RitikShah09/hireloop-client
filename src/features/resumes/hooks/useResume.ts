import { useQuery } from '@tanstack/react-query';
import { resumesService } from '@/services/resumes.service';
import { queryKeys } from '@/lib/queryKeys';

export const useResumes = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.resumes.all,
    queryFn: () => resumesService.getAll().then((r) => r.data),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
