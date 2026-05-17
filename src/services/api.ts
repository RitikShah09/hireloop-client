export type { ApiResponse } from '@/types/api.types';
export type { LoginPayload, RegisterPayload, AuthUser, Session } from '@/types/auth.types';
export type { Job } from '@/types/job.types';
export type { Application, Stats } from '@/types/application.types';
export type { Resume, ResumeData } from '@/types/resume.types';
export type { CandidateProfile, CompanyProfile } from '@/types/profile.types';
export type { Certification, WorkExperience, Education, Milestone } from '@/types/candidate.types';
export type { Notification } from '@/types/notification.types';
export type { Interview } from '@/types/interview.types';

export { authService as authApi } from './auth.service';
export { jobsService as jobsApi } from './jobs.service';
export { applicationsService as applicationsApi } from './applications.service';
export { resumesService as resumesApi } from './resumes.service';
export { profileService as profileApi } from './profile.service';
export { candidateService as candidateApi } from './candidate.service';
export { notificationsService as notificationsApi } from './notifications.service';
export { interviewsService as interviewsApi } from './interviews.service';
export { resumeBuilderService as resumeBuilderApi } from './resume-builder.service';
export { searchService as searchApi } from './search.service';

import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { Job } from '@/types/job.types';
export const aiSearchApi = {
  search: (query: string) =>
    api.post<
      ApiResponse<{
        matches: Array<{
          id: string;
          relevanceScore: number;
          reason: string;
          job?: Job;
        }>;
        suggestion: string;
      }>
    >('/jobs/ai-search', { query }),
};
