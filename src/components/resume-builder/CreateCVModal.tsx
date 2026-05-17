'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resumeBuilderApi } from '@/services/api';
import { ResumeBuilderState, defaultState, generateId } from './types';
import { X, FileText, Sparkles, Upload, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'options' | 'upload' | 'prompt';

interface Props {
  onComplete: (state: ResumeBuilderState) => void;
  onClose: () => void;
}

const mapAPIToState = (
  data: ReturnType<typeof resumeBuilderApi.buildFromScratch> extends Promise<infer T> ? T : never
): ResumeBuilderState => {
  // This gets overridden by actual usage below
  return defaultState;
};

export default function CreateCVModal({ onComplete, onClose }: Props) {
  const [step, setStep] = useState<Step>('options');
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: buildFromUpload, isPending: uploadPending } = useMutation({
    mutationFn: () => resumeBuilderApi.buildFromUpload(file!, undefined),
    onSuccess: (res) => {
      if (res.data.data) {
        onComplete(convertAPIData(res.data.data));
        toast.success('Resume imported!');
      }
    },
    onError: () => toast.error('Failed to process PDF. Try again.'),
  });

  const { mutate: buildFromPrompt, isPending: promptPending } = useMutation({
    mutationFn: () =>
      resumeBuilderApi.buildFromScratch({
        name: '',
        email: '',
        phone: '',
        location: '',
        targetRole: '',
        yearsOfExperience: '0',
        skills: '',
        education: '',
        previousRoles: prompt,
      }),
    onSuccess: (res) => {
      if (res.data.data) {
        onComplete(convertAPIData(res.data.data));
        toast.success('Resume generated!');
      }
    },
    onError: () => toast.error('Failed to generate. Try again.'),
  });

  const convertAPIData = (data: any): ResumeBuilderState => {
    const pi = data.personalInfo || {};
    const nameParts = (pi.fullName || '').split(' ');
    return {
      personalInfo: {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        jobTitle: data.experience?.[0]?.role || '',
        email: pi.email || '',
        phone: pi.phone || '',
        city: (pi.location || '').split(',')[0]?.trim() || '',
        state: (pi.location || '').split(',')[1]?.trim() || '',
        country: 'India',
        zipCode: '',
      },
      socialLinks: [
        { id: '1', label: 'LinkedIn', url: pi.linkedinUrl || '' },
        { id: '2', label: 'GitHub', url: pi.githubUrl || '' },
        { id: '3', label: 'Youtube', url: '' },
      ],
      summary: data.summary || '',
      workExperience: (data.experience || []).map((e: any) => ({
        id: generateId(),
        jobTitle: e.role || '',
        companyName: e.company || '',
        startDate: (e.duration || '').split(' - ')[0] || '',
        endDate: (e.duration || '').split(' - ')[1] || '',
        isCurrent: (e.duration || '').toLowerCase().includes('present'),
        details: (e.responsibilities || []).join('\n'),
      })),
      skillGroups: data.skills?.length
        ? [{ id: generateId(), category: 'Technical Skills', skills: data.skills }]
        : [],
      languages: [],
      projects: (data.projects || []).map((p: any) => ({
        id: generateId(),
        title: p.name || '',
        url: p.link || '',
        organization: '',
        startDate: '',
        endDate: '',
        details: `${p.description || ''}\nTech: ${(p.techStack || []).join(', ')}`,
      })),
      education: (data.education || []).map((e: any) => ({
        id: generateId(),
        degree: e.degree || '',
        institution: e.institution || '',
        organization: '',
        startDate: '',
        endDate: e.year || '',
        details: '',
      })),
      certificates: (data.certifications || []).map((c: string) => ({
        id: generateId(),
        name: c,
        url: '',
      })),
      hobbies: '',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900">
        <div className="flex items-start justify-between border-b border-gray-700 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Create your Resume</h2>
            <p className="mt-0.5 text-sm text-gray-400">
              Go with the option that fits best for you
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 transition hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Step: Options */}
          {step === 'options' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('upload')}
                className="hover:bg-gray-750 hover:border-primary flex w-full items-center gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4 text-left transition"
              >
                <div className="bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <FileText size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white">Upload your Resume</p>
                  <p className="text-sm text-gray-400">Pick a resume from your device</p>
                </div>
              </button>

              <button
                onClick={() => setStep('prompt')}
                className="hover:bg-gray-750 hover:border-primary flex w-full items-center gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4 text-left transition"
              >
                <div className="bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white">Start with AI Prompt</p>
                  <p className="text-sm text-gray-400">Give a prompt to AI for your resume</p>
                </div>
              </button>

              <button
                onClick={() => onComplete(defaultState)}
                className="hover:bg-gray-750 hover:border-primary flex w-full items-center gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4 text-left transition"
              >
                <div className="bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Upload size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white">Start from Scratch</p>
                  <p className="text-sm text-gray-400">Fill in your details manually</p>
                </div>
              </button>
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                className={`mb-4 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
                  file ? 'border-primary bg-primary-light' : 'hover:border-primary border-gray-600'
                }`}
              >
                {file ? (
                  <div>
                    <FileText size={28} className="text-primary mx-auto mb-2" />
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={28} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-primary text-sm">
                      <span className="cursor-pointer underline">Upload a file</span> or drag and
                      drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">.pdf and .docx up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                  }}
                />
              </div>

              {/* Show file name if uploaded */}
              {file && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-800 p-3">
                  <FileText size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-white">New Resume</p>
                    <p className="text-xs text-gray-400">{file.name}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('options')}
                  className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-gray-800"
                >
                  <ArrowLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => buildFromUpload()}
                  disabled={!file || uploadPending}
                  className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
                >
                  {uploadPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: AI Prompt */}
          {step === 'prompt' && (
            <div>
              <p className="mb-3 text-sm text-gray-400">
                We'll carefully craft your resume using the context you've provided.
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Provide instructions to create your resume..."
                rows={6}
                className="focus:ring-primary w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:outline-none"
              />
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setStep('options')}
                  className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-gray-800"
                >
                  <ArrowLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => buildFromPrompt()}
                  disabled={!prompt.trim() || promptPending}
                  className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
                >
                  {promptPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
