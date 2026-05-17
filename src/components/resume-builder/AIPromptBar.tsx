'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Props {
  context: string; // what section this is for
  currentValue: string; // current text content
  onResult: (enhanced: string) => void;
  placeholder?: string;
}

export const AIPromptBar = ({
  context,
  currentValue,
  onResult,
  placeholder = 'Give prompt...',
}: Props) => {
  const [prompt, setPrompt] = useState('');

  const { mutate: enhance, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.post('/resume-builder/enhance-section', {
        section: context, // section name
        context: currentValue, // current content
        userPrompt: prompt, // user's instruction
      });
      return res.data.data as string;
    },
    onSuccess: (enhanced) => {
      if (enhanced) {
        onResult(enhanced);
        setPrompt('');
        toast.success('AI enhanced!');
      }
    },
    onError: () => toast.error('AI enhancement failed'),
  });

  return (
    <div className="mt-3 flex gap-2">
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && prompt.trim() && enhance()}
        placeholder={placeholder}
        className="focus:ring-primary flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
      />
      <button
        onClick={() => enhance()}
        disabled={isPending || !prompt.trim()}
        className="bg-primary hover:bg-primary-hover rounded-lg p-2 text-white transition disabled:opacity-50"
        title="Enhance with AI"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
      </button>
    </div>
  );
};
