export interface Certification {
  id: string;
  candidateId: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  candidateId: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  candidateId: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  candidateId: string;
  title: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
