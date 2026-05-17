export { queryKeys } from '@/lib/queryKeys';

export { useSessions } from '@/features/auth';
export { useRevokeSession, useChangePassword } from '@/features/auth';

export { useJobs, useJob, useMyJobs, useSuggestedJobs } from '@/features/jobs';
export { useCreateJob, useUpdateJob, useDeleteJob } from '@/features/jobs';

export {
  useApplications,
  useCandidateApplications,
  useApplicationStats,
} from '@/features/applications';
export {
  useApplyToJob,
  useUpdateApplicationStatus,
  useChatWithPool,
} from '@/features/applications';

export { useResumes } from '@/features/resumes';
export { useUploadResume, useDeleteResume, useSetDefaultResume } from '@/features/resumes';

export { useCandidateProfile, useCompanyProfile } from '@/features/profile';
export { useUpdateCandidateProfile, useUpdateCompanyProfile } from '@/features/profile';

export {
  useCertifications,
  useWorkExperience,
  useEducation,
  useMilestones,
} from '@/features/candidate';
export {
  useAddCertification,
  useUpdateCertification,
  useDeleteCertification,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useAddMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
} from '@/features/candidate';

export {
  useNotifications,
  useInfiniteNotifications,
  useUnreadNotificationCount,
} from '@/features/notifications';
export type { NotifPage } from '@/features/notifications';
export {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
} from '@/features/notifications';

export { useInterviews } from '@/features/interviews';
export {
  useScheduleInterview,
  useUpdateInterview,
  useRespondToInterview,
} from '@/features/interviews';
