export interface Job {
  id: string;
  companyId?: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location?: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  experienceMin?: number;
  experienceMax?: number;
  matchScore?: number;
  status: string;
  shareableSlug: string;
  closingDate?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    name: string;
    logoUrl?: string;
    location?: string;
    industry?: string;
  };
  _count?: { applications: number };
}
