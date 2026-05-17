import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { CandidateProfile, CompanyProfile } from '@/types/profile.types';

export const profileService = {
  getCandidate: () => api.get<ApiResponse<CandidateProfile>>('/profiles/candidate'),

  updateCandidate: (data: Partial<CandidateProfile>) =>
    api.patch<ApiResponse<CandidateProfile>>('/profiles/candidate', data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post<ApiResponse<{ avatarUrl: string }>>('/profiles/candidate/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCompany: () => api.get<ApiResponse<CompanyProfile>>('/profiles/company'),

  updateCompany: (data: Partial<CompanyProfile>) =>
    api.patch<ApiResponse<CompanyProfile>>('/profiles/company', data),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post<ApiResponse<{ logoUrl: string }>>('/profiles/company/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPublicCompany: (id: string) =>
    api.get<ApiResponse<CompanyProfile>>(`/profiles/company/${id}/public`),
};
