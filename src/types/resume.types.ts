export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
  }>;
  education: Array<{ institution: string; degree: string; year: string }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    techStack: string[];
    link?: string;
  }>;
  certifications?: string[];
}
