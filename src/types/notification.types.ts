export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: 'APPLICATION' | 'INTERVIEW' | 'JOB' | 'SYSTEM' | 'PROFILE';
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
