import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { Resume } from '@/types/resume.types';

export const resumesService = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post<ApiResponse<Resume>>('/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAll: () => api.get<ApiResponse<Resume[]>>('/resumes'),

  delete: (id: string) => api.delete(`/resumes/${id}`),

  setDefault: (id: string) => api.patch(`/resumes/${id}/default`),
};
