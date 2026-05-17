import type { Job } from './job.types';
import type { Interview } from './interview.types';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId: string;
  coverLetter?: string;
  status: string;
  aiScore?: number;
  aiSummary?: string;
  aiStrengths: string[];
  aiWeaknesses: string[];
  screenedAt?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    skills: string[];
    linkedinUrl?: string;
    location?: string;
  };
  resume?: { id: string; fileName: string; fileUrl: string };
  interviews?: Interview[];
}

export interface Stats {
  total: number;
  pending: number;
  screening?: number;
  shortlisted: number;
  rejected: number;
  hired: number;
}
