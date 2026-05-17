import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { Job } from '@/types/job.types';
import type { Certification, WorkExperience, Education, Milestone } from '@/types/candidate.types';

export const candidateService = {
  getFullProfile: () => api.get('/candidate/full-profile'),

  getSuggestedJobs: () => api.get<ApiResponse<Job[]>>('/candidate/suggested-jobs'),

  getCertifications: () => api.get<ApiResponse<Certification[]>>('/candidate/certifications'),
  addCertification: (data: Partial<Certification>) =>
    api.post<ApiResponse<Certification>>('/candidate/certifications', data),
  updateCertification: (id: string, data: Partial<Certification>) =>
    api.patch<ApiResponse<Certification>>(`/candidate/certifications/${id}`, data),
  deleteCertification: (id: string) => api.delete(`/candidate/certifications/${id}`),

  getExperience: () => api.get<ApiResponse<WorkExperience[]>>('/candidate/experience'),
  addExperience: (data: Partial<WorkExperience>) =>
    api.post<ApiResponse<WorkExperience>>('/candidate/experience', data),
  updateExperience: (id: string, data: Partial<WorkExperience>) =>
    api.patch<ApiResponse<WorkExperience>>(`/candidate/experience/${id}`, data),
  deleteExperience: (id: string) => api.delete(`/candidate/experience/${id}`),

  getEducation: () => api.get<ApiResponse<Education[]>>('/candidate/education'),
  addEducation: (data: Partial<Education>) =>
    api.post<ApiResponse<Education>>('/candidate/education', data),
  updateEducation: (id: string, data: Partial<Education>) =>
    api.patch<ApiResponse<Education>>(`/candidate/education/${id}`, data),
  deleteEducation: (id: string) => api.delete(`/candidate/education/${id}`),

  getMilestones: () => api.get<ApiResponse<Milestone[]>>('/candidate/milestones'),
  addMilestone: (data: Partial<Milestone>) =>
    api.post<ApiResponse<Milestone>>('/candidate/milestones', data),
  updateMilestone: (id: string, data: Partial<Milestone>) =>
    api.patch<ApiResponse<Milestone>>(`/candidate/milestones/${id}`, data),
  deleteMilestone: (id: string) => api.delete(`/candidate/milestones/${id}`),
};
