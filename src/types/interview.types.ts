import type { Application } from './application.types';

export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  durationMins: number;
  mode: string;
  meetLink?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  application?: Application;
}
