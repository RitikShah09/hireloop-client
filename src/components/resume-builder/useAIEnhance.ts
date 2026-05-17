'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export const useAIEnhance = () => {
  const [prompt, setPrompt] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      section,
      context,
      userPrompt,
    }: {
      section: string;
      context: string;
      userPrompt: string;
    }) => {
      const res = await api.post('/resume-builder/enhance-section', {
        section,
        context,
        userPrompt,
      });
      return res.data.data as string;
    },
    onError: () => toast.error('AI enhancement failed. Please try again.'),
  });

  return { prompt, setPrompt, enhance: mutate, isPending };
};
