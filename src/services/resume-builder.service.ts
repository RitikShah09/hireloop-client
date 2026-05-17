import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { ResumeData } from '@/types/resume.types';

export const resumeBuilderService = {
  buildFromScratch: (data: Record<string, string>) =>
    api.post<ApiResponse<ResumeData>>('/resume-builder/from-scratch', data),

  buildFromUpload: (file: File, targetRole?: string) => {
    const form = new FormData();
    form.append('resume', file);
    if (targetRole) form.append('targetRole', targetRole);
    return api.post<ApiResponse<ResumeData>>('/resume-builder/from-upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  buildFromExisting: (resumeId: string, targetRole?: string) =>
    api.post<ApiResponse<ResumeData>>(`/resume-builder/from-existing/${resumeId}`, { targetRole }),
};
