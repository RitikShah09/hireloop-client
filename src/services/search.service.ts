import api from '@/lib/axios';

export const searchService = {
  candidates: (params?: Record<string, string>) => api.get('/search/candidates', { params }),

  companies: (params?: Record<string, string>) => api.get('/search/companies', { params }),
};
