export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    list: (params?: Record<string, string>) => ['jobs', 'list', params] as const,
    detail: (id: string) => ['jobs', id] as const,
    mine: (params?: Record<string, string>) => ['jobs', 'mine', params] as const,
    suggested: ['jobs', 'suggested'] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: (params?: Record<string, string>) => ['applications', 'list', params] as const,
    stats: ['applications', 'stats'] as const,
  },
  resumes: {
    all: ['resumes'] as const,
  },
  profile: {
    candidate: ['profile', 'candidate'] as const,
    company: ['profile', 'company'] as const,
  },
  sessions: ['sessions'] as const,
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, string>) => ['notifications', 'list', params] as const,
    infinite: (params?: Record<string, string>) => ['notifications', 'infinite', params] as const,
    count: ['notifications', 'count'] as const,
  },
  candidate: {
    certifications: ['candidate', 'certifications'] as const,
    experience: ['candidate', 'experience'] as const,
    education: ['candidate', 'education'] as const,
    milestones: ['candidate', 'milestones'] as const,
  },
  interviews: {
    all: ['interviews'] as const,
    list: (params?: Record<string, string>) => ['interviews', 'list', params] as const,
  },
};
