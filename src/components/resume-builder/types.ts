export interface PersonalInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  details: string;
}

export interface Project {
  id: string;
  title: string;
  url: string;
  organization: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  organization: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
}

export interface Certificate {
  id: string;
  name: string;
  url: string;
}

export interface ResumeBuilderState {
  personalInfo: PersonalInfo;
  socialLinks: SocialLink[];
  summary: string;
  workExperience: WorkExperience[];
  skillGroups: SkillGroup[];
  languages: string[];
  projects: Project[];
  education: Education[];
  certificates: Certificate[];
  hobbies: string;
}

export const defaultState: ResumeBuilderState = {
  personalInfo: {
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
  },
  socialLinks: [
    { id: '1', label: 'LinkedIn', url: '' },
    { id: '2', label: 'GitHub', url: '' },
    { id: '3', label: 'Youtube', url: '' },
  ],
  summary: '',
  workExperience: [],
  skillGroups: [],
  languages: [],
  projects: [],
  education: [],
  certificates: [],
  hobbies: '',
};

export const generateId = () => Math.random().toString(36).slice(2, 9);
