'use client';

import { useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useResumes, useUploadResume, useDeleteResume, queryKeys } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumesApi, ApiResponse, Resume } from '@/services/api';
import api from '@/lib/axios';
import {
  FileText,
  Upload,
  Trash2,
  Star,
  ExternalLink,
  FilePlus,
  Info,
  Plus,
  X,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Badge,
  PageHeader,
  EmptyState,
  Skeleton,
  ConfirmDialog,
  CustomSelect,
} from '@/components/ui';
import { AccordionSection } from '@/components/resume-builder/AccordionSection';
import { AIPromptBar } from '@/components/resume-builder/AIPromptBar';
import { ResumePreview } from '@/components/resume-builder/ResumePreview';
import {
  ResumeBuilderState,
  defaultState,
  generateId,
  WorkExperience,
  Project,
  Education,
  Certificate,
} from '@/components/resume-builder/types';

function MyResumesTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useResumes();
  const { mutate: upload, isPending: uploading } = useUploadResume();
  const { mutate: deleteResume } = useDeleteResume();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { mutate: setDefault } = useMutation({
    mutationFn: (id: string) => resumesApi.setDefault(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resumes.all });
      toast.success('Default resume updated');
    },
  });

  const resumes = data?.data || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    upload(file);
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-end">
        <Button
          leftIcon={<Upload size={14} />}
          isLoading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          Upload Resume
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onClick={() => fileRef.current?.click()}
        className="border-border hover:border-primary hover:bg-primary-light transition-smooth cursor-pointer rounded-lg border-2 border-dashed p-8 text-center"
      >
        <FilePlus size={28} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Click to upload or drag & drop</p>
        <p className="text-muted-foreground/70 mt-1 text-xs">PDF only, max 5MB</p>
      </div>

      <div className="bg-primary-light flex items-start gap-2 rounded-lg p-3">
        <Info size={14} className="text-primary mt-0.5 shrink-0" />
        <p className="text-primary text-xs">
          Your resume is parsed and embedded automatically for AI matching. The default resume is
          pre-selected when applying.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<FileText size={36} />}
          title="No resumes uploaded yet"
          description="Upload your PDF resume to start applying to jobs"
        />
      ) : (
        <div className="space-y-3">
          {resumes.map((r) => (
            <Card key={r.id} className={r.isDefault ? 'ring-primary/30 ring-1' : undefined}>
              <div className="flex items-center gap-3">
                <div className="bg-danger-light flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <FileText size={20} className="text-danger" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-foreground truncate text-sm font-medium">{r.fileName}</p>
                    {r.isDefault && (
                      <Badge variant="primary" dot>
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Uploaded{' '}
                    {formatDistanceToNow(new Date(r.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:bg-primary-light transition-micro rounded-lg p-1.5"
                    title="View resume"
                  >
                    <ExternalLink size={15} />
                  </a>
                  {!r.isDefault && (
                    <button
                      onClick={() => setDefault(r.id)}
                      className="text-muted-foreground hover:text-warning hover:bg-warning-light transition-micro rounded-lg p-1.5"
                      title="Set as default"
                    >
                      <Star size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteId(r.id)}
                    className="text-muted-foreground hover:text-danger hover:bg-danger-light transition-micro rounded-lg p-1.5"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteResume(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete resume"
        description="Are you sure you want to delete this resume? This cannot be undone."
      />
    </div>
  );
}

const CreateModal = ({
  onClose,
  onFromUpload,
  onFromPrompt,
}: {
  onClose: () => void;
  onFromUpload: (data: Record<string, unknown>) => void;
  onFromPrompt: (prompt: string) => void;
}) => {
  const [step, setStep] = useState<'options' | 'upload' | 'prompt'>('options');
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      const res = await api.post('/resume-builder/from-upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.data) onFromUpload(res.data.data);
    } catch {
      toast.error('Failed to parse resume. Try a text-based PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="bg-surface border-border animate-scale-in relative w-full max-w-md overflow-hidden rounded-xl border">
        <div className="border-border flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-foreground text-base font-semibold">Create your Resume</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {step === 'options'
                ? 'Choose how you want to start'
                : step === 'upload'
                  ? 'Upload your existing resume to prefill the editor'
                  : 'Describe yourself and let AI craft your resume'}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm ml-4 rounded-sm p-1.5">
            <X size={14} />
          </button>
        </div>
        <div className="p-6">
          {step === 'options' && (
            <div className="space-y-3">
              {[
                {
                  icon: <FileText size={18} className="text-primary" />,
                  label: 'Upload Existing Resume',
                  sub: "We'll parse your PDF and prefill the editor",
                  action: () => setStep('upload'),
                  bg: 'bg-primary-light',
                },
                {
                  icon: <Sparkles size={18} className="text-success" />,
                  label: 'Start with AI Prompt',
                  sub: 'Describe your experience and let AI build it',
                  action: () => setStep('prompt'),
                  bg: 'bg-success-light',
                },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="bg-surface border-border hover:border-border-strong transition-smooth flex w-full items-center gap-4 rounded-md border p-4 text-left hover:bg-[hsl(var(--surface-raised))]"
                >
                  <div
                    className={`h-10 w-10 ${opt.bg} flex shrink-0 items-center justify-center rounded`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{opt.label}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {step === 'upload' && (
            <div>
              {!file ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-border hover:border-primary transition-smooth cursor-pointer rounded border-2 border-dashed p-10 text-center"
                >
                  <Upload size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-foreground text-sm">
                    <span className="text-primary underline">Upload a file</span> or drag and drop
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">PDF files only, up to 5MB</p>
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
              ) : (
                <div className="border-border flex items-center gap-3 rounded border bg-[hsl(var(--surface-raised))] p-4">
                  <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          {step === 'prompt' && (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="e.g. I'm a full-stack developer with 3 years of experience in Node.js and React..."
              className="input resize-none"
            />
          )}
        </div>
        <div className="border-border flex justify-between border-t px-6 py-4">
          <button
            onClick={() => (step === 'options' ? onClose() : setStep('options'))}
            className="btn btn-md btn-secondary"
          >
            {step === 'options' ? 'Cancel' : '← Back'}
          </button>
          {step !== 'options' && (
            <button
              onClick={
                step === 'upload'
                  ? handleUpload
                  : () => {
                      if (prompt.trim()) onFromPrompt(prompt);
                    }
              }
              disabled={loading || (step === 'upload' ? !file : !prompt.trim())}
              className="btn btn-md btn-primary"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? 'Generating…' : 'Generate Resume'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EditorInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div>
    <label className="label">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input bg-background"
    />
  </div>
);

const EditorTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <div>
    {label && <label className="label">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="input bg-background resize-none"
    />
  </div>
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() - i));

const DatePicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const parts = value ? value.split(' ') : ['', ''];
  const m = parts[0] || '',
    y = parts[1] || '';
  const update = (nm: string, ny: string) => onChange(nm && ny ? `${nm} ${ny}` : '');
  return (
    <div>
      <label className="label">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <CustomSelect
          placeholder="Month"
          value={m}
          onChange={(v) => update(v, y)}
          options={MONTHS.map((mo) => ({ value: mo, label: mo }))}
        />
        <CustomSelect
          placeholder="Year"
          value={y}
          onChange={(v) => update(m, v)}
          options={YEARS.map((yr) => ({ value: yr, label: yr }))}
        />
      </div>
    </div>
  );
};

const ItemCard = ({
  title,
  children,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-border mb-2 rounded border">
      <button
        className={`bg-muted hover:bg-muted/80 flex w-full items-center justify-between px-3 py-2.5 transition ${open ? 'rounded-t-lg' : 'rounded-lg'}`}
        onClick={() => setOpen(!open)}
      >
        <span className="text-foreground truncate text-sm font-medium">{title}</span>
        {open ? (
          <ChevronUp size={13} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={13} className="text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-border space-y-3 rounded-b border-t p-3">
          {children}
          <button onClick={onRemove} className="text-danger hover:text-danger/70 text-xs">
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

const AddBtn = ({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`${className}text-primary border-primary/30 hover:bg-primary-light flex w-full items-center justify-center gap-1.5 rounded border border-dashed px-3 py-2 text-xs transition`}
  >
    <Plus size={13} /> {label}
  </button>
);

function ResumeBuilderTab() {
  const qc = useQueryClient();
  const previewRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>('editor');
  const [state, setState] = useState<ResumeBuilderState>(defaultState);
  const [skillInputs, setSkillInputs] = useState<Record<string, string>>({});
  const [langInput, setLangInput] = useState('');

  const set = useCallback(
    <K extends keyof ResumeBuilderState>(k: K, v: ResumeBuilderState[K]) =>
      setState((prev) => ({ ...prev, [k]: v })),
    []
  );

  const setP = (field: string, value: string) =>
    setState((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));

  const applyAIData = (data: Record<string, unknown>) => {
    const pi = (data.personalInfo || {}) as Record<string, string>;
    const nameParts = (pi.fullName || '').split(' ');
    setState({
      personalInfo: {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        jobTitle: pi.jobTitle || '',
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
      summary: (data.summary as string) || '',
      workExperience: ((data.experience || []) as Array<Record<string, unknown>>).map((e) => ({
        id: generateId(),
        jobTitle: (e.role as string) || '',
        companyName: (e.company as string) || '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        details: ((e.responsibilities || []) as string[]).map((r) => `• ${r}`).join('\n'),
      })),
      projects: ((data.projects || []) as Array<Record<string, unknown>>).map((p) => ({
        id: generateId(),
        title: (p.name as string) || '',
        url: (p.link as string) || '',
        organization: '',
        startDate: '',
        endDate: '',
        details: `${p.description || ''}\nTech: ${((p.techStack || []) as string[]).join(', ')}`,
      })),
      education: ((data.education || []) as Array<Record<string, unknown>>).map((e) => ({
        id: generateId(),
        degree: (e.degree as string) || '',
        institution: (e.institution as string) || '',
        organization: '',
        startDate: '',
        endDate: (e.year as string) || '',
        details: '',
      })),
      skillGroups: [
        {
          id: generateId(),
          category: 'Technical Skills',
          skills: (data.skills as string[]) || [],
        },
      ],
      languages: [],
      certificates: ((data.certifications || []) as string[]).map((c) => ({
        id: generateId(),
        name: c,
        url: '',
      })),
      hobbies: '',
    });
    setHasResume(true);
    setShowModal(false);
  };

  const handleFromPrompt = async (prompt: string) => {
    setShowModal(false);
    setIsGenerating(true);
    try {
      const res = await api.post('/resume-builder/from-scratch', {
        name: 'Professional',
        email: 'email@example.com',
        phone: '',
        location: '',
        targetRole: prompt,
        yearsOfExperience: '3',
        skills: prompt,
        education: '',
      });
      if (res.data.data) applyAIData(res.data.data);
    } catch {
      toast.error('Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPdfBlob = async (): Promise<{
    blob: Blob;
    fileName: string;
  } | null> => {
    const element = previewRef.current;
    if (!element) return null;

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const firstName = state.personalInfo.firstName || 'Resume';
    const lastName = state.personalInfo.lastName || '';
    const fileName = `${firstName}_${lastName}_Resume`.replace(/\s+/g, '_');

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas-pro'),
      import('jspdf'),
    ]);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pageW = 210;
      const imgH = (canvas.height * pageW) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      const pdf = new jsPDF({
        unit: 'mm',
        format: [pageW, imgH],
        orientation: 'portrait',
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH);

      const blob = pdf.output('blob');
      return { blob, fileName };
    } catch (err) {
      console.error('PDF generation error:', err);
      throw err;
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const result = await buildPdfBlob();
      if (!result) return;
      const { blob, fileName } = result;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Resume downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Download failed. Try Ctrl+P → Save as PDF instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await buildPdfBlob();
      if (!result) return;
      const { blob, fileName } = result;
      const file = new File([blob], `${fileName}.pdf`, {
        type: 'application/pdf',
      });
      const formData = new FormData();
      formData.append('resume', file);
      const uploadRes = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newResume = uploadRes.data?.data as Resume | undefined;
      if (newResume) {
        qc.setQueryData(queryKeys.resumes.all, (old: ApiResponse<Resume[]> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: [newResume, ...old.data] };
        });
        toast.success('Resume saved to your library!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addExp = () =>
    set('workExperience', [
      ...state.workExperience,
      {
        id: generateId(),
        jobTitle: 'New Position',
        companyName: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        details: '',
      },
    ]);
  const updExp = (id: string, f: keyof WorkExperience, v: string | boolean) =>
    set(
      'workExperience',
      state.workExperience.map((e) => (e.id === id ? { ...e, [f]: v } : e))
    );
  const delExp = (id: string) =>
    set(
      'workExperience',
      state.workExperience.filter((e) => e.id !== id)
    );

  const addProj = () =>
    set('projects', [
      ...state.projects,
      {
        id: generateId(),
        title: 'New Project',
        url: '',
        organization: '',
        startDate: '',
        endDate: '',
        details: '',
      },
    ]);
  const updProj = (id: string, f: keyof Project, v: string) =>
    set(
      'projects',
      state.projects.map((p) => (p.id === id ? { ...p, [f]: v } : p))
    );
  const delProj = (id: string) =>
    set(
      'projects',
      state.projects.filter((p) => p.id !== id)
    );

  const addEdu = () =>
    set('education', [
      ...state.education,
      {
        id: generateId(),
        degree: "Bachelor's Degree",
        institution: '',
        organization: '',
        startDate: '',
        endDate: '',
        details: '',
      },
    ]);
  const updEdu = (id: string, f: keyof Education, v: string) =>
    set(
      'education',
      state.education.map((e) => (e.id === id ? { ...e, [f]: v } : e))
    );
  const delEdu = (id: string) =>
    set(
      'education',
      state.education.filter((e) => e.id !== id)
    );

  const addSkillGroup = () =>
    set('skillGroups', [...state.skillGroups, { id: generateId(), category: '', skills: [] }]);
  const addSkill = (gid: string) => {
    const v = (skillInputs[gid] || '').trim();
    if (!v) return;
    set(
      'skillGroups',
      state.skillGroups.map((g) => (g.id === gid ? { ...g, skills: [...g.skills, v] } : g))
    );
    setSkillInputs((p) => ({ ...p, [gid]: '' }));
  };
  const delSkill = (gid: string, skill: string) =>
    set(
      'skillGroups',
      state.skillGroups.map((g) =>
        g.id === gid ? { ...g, skills: g.skills.filter((s) => s !== skill) } : g
      )
    );

  const addCert = () =>
    set('certificates', [...state.certificates, { id: generateId(), name: '', url: '' }]);
  const updCert = (id: string, f: keyof Certificate, v: string) =>
    set(
      'certificates',
      state.certificates.map((c) => (c.id === id ? { ...c, [f]: v } : c))
    );
  const updLink = (id: string, v: string) =>
    set(
      'socialLinks',
      state.socialLinks.map((s) => (s.id === id ? { ...s, url: v } : s))
    );

  if (!hasResume && !isGenerating) {
    return (
      <div className="flex items-center justify-center py-16">
        {showModal && (
          <CreateModal
            onClose={() => setShowModal(false)}
            onFromUpload={applyAIData}
            onFromPrompt={handleFromPrompt}
          />
        )}
        <div className="max-w-sm text-center">
          <div className="bg-primary-light border-primary/20 mx-auto mb-6 flex h-36 w-52 items-center justify-center rounded-lg border">
            <div className="bg-surface border-border w-36 space-y-1.5 rounded border p-3 text-left text-xs">
              <div className="bg-primary/30 mx-auto mb-2 h-2 w-20 rounded" />
              <div className="bg-muted h-1.5 w-full rounded" />
              <div className="bg-muted h-1.5 w-5/6 rounded" />
              <div className="bg-border mt-2 h-1.5 w-full rounded" />
              <div className="bg-border h-1.5 w-4/5 rounded" />
              <div className="mt-2 flex gap-1">
                {['bg-primary/30', 'bg-primary/20', 'bg-primary/30'].map((c, i) => (
                  <div key={i} className={`h-1.5 ${c} flex-1 rounded`} />
                ))}
              </div>
            </div>
          </div>
          <h2 className="text-foreground mb-2 text-xl font-bold">Build your Resume</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Upload an existing resume to prefill the editor, or start fresh with an AI prompt.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-lg btn-primary mx-auto">
            <Plus size={16} /> Get Started
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="bg-primary-light mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
            <Sparkles size={24} className="text-primary animate-pulse" />
          </div>
          <p className="text-foreground font-medium">AI is building your resume…</p>
          <p className="text-muted-foreground mt-1 text-sm">This takes about 10 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-builder-layout flex flex-col">
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onFromUpload={applyAIData}
          onFromPrompt={handleFromPrompt}
        />
      )}

      <div className="border-border flex shrink-0 items-center justify-between gap-3 border-b py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setHasResume(false);
              setState(defaultState);
            }}
            className="btn btn-sm btn-secondary"
            title="Start a new resume"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New</span>
          </button>

          <div className="bg-muted flex gap-0.5 rounded-lg p-0.5 lg:hidden">
            <button
              onClick={() => setMobilePanel('editor')}
              className={`transition-micro cursor-pointer rounded-md px-3 py-1 text-xs font-medium ${mobilePanel === 'editor' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobilePanel('preview')}
              className={`transition-micro cursor-pointer rounded-md px-3 py-1 text-xs font-medium ${mobilePanel === 'preview' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading || isSaving}
            className="btn btn-sm btn-secondary"
            title="Download as PDF"
          >
            {isDownloading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span className="hidden sm:inline">{isDownloading ? 'Downloading…' : 'Download'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isDownloading}
            className="btn btn-sm btn-primary"
            title="Save to your Resume library"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span className="hidden sm:inline">{isSaving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="resume-builder-split flex flex-1">
        <div
          className={`border-border flex w-full shrink-0 flex-col bg-[hsl(var(--surface-raised))] lg:w-100 lg:border-r ${mobilePanel === 'preview' ? 'hidden lg:flex' : 'flex'}`}
        >
          <div className="resume-builder-editor space-y-1 pt-4 pb-8 sm:pr-5">
            <AccordionSection title="Personal Details" defaultOpen>
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-medium">Basic Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <EditorInput
                    label="First Name"
                    value={state.personalInfo.firstName}
                    onChange={(v) => setP('firstName', v)}
                    placeholder="John"
                  />
                  <EditorInput
                    label="Last Name"
                    value={state.personalInfo.lastName}
                    onChange={(v) => setP('lastName', v)}
                    placeholder="Doe"
                  />
                </div>
                <EditorInput
                  label="Job Title"
                  value={state.personalInfo.jobTitle}
                  onChange={(v) => setP('jobTitle', v)}
                  placeholder="Full Stack Developer"
                />
                <EditorInput
                  label="Email"
                  value={state.personalInfo.email}
                  onChange={(v) => setP('email', v)}
                  placeholder="john@gmail.com"
                />
                <EditorInput
                  label="Phone"
                  value={state.personalInfo.phone}
                  onChange={(v) => setP('phone', v)}
                  placeholder="+91 9876543210"
                />
                <div className="border-border border-t pt-1">
                  <p className="text-muted-foreground mb-3 text-xs font-medium">Address</p>
                  <div className="space-y-3">
                    <EditorInput
                      label="City"
                      value={state.personalInfo.city}
                      onChange={(v) => setP('city', v)}
                      placeholder="Pune"
                    />
                    <EditorInput
                      label="State"
                      value={state.personalInfo.state}
                      onChange={(v) => setP('state', v)}
                      placeholder="Maharashtra"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <CustomSelect
                        label="Country"
                        value={state.personalInfo.country}
                        onChange={(v) => setP('country', v)}
                        options={[
                          'India',
                          'USA',
                          'UK',
                          'Canada',
                          'Australia',
                          'Germany',
                          'Singapore',
                        ].map((c) => ({ value: c, label: c }))}
                      />
                      <EditorInput
                        label="Zip Code"
                        value={state.personalInfo.zipCode}
                        onChange={(v) => setP('zipCode', v)}
                        placeholder="411047"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Social Links">
              <div className="space-y-3">
                {state.socialLinks.map((link) => (
                  <div key={link.id}>
                    <label className="label">{link.label}</label>
                    <input
                      value={link.url}
                      onChange={(e) => updLink(link.id, e.target.value)}
                      placeholder={`https://${link.label.toLowerCase()}.com/...`}
                      className="input bg-background"
                    />
                  </div>
                ))}
                {state.socialLinks.filter(
                  (s) => !['LinkedIn', 'GitHub', 'Youtube'].includes(s.label)
                ).length === 0 && (
                  <AddBtn
                    label="Add Link"
                    onClick={() =>
                      set('socialLinks', [
                        ...state.socialLinks,
                        { id: generateId(), label: 'My Website', url: '' },
                      ])
                    }
                  />
                )}
              </div>
            </AccordionSection>

            <AccordionSection title="Professional Summary">
              <EditorTextarea
                value={state.summary}
                onChange={(v) => set('summary', v)}
                placeholder="Experienced Full-Stack Developer with 4 years of expertise…"
                rows={4}
              />
              <AIPromptBar
                context="professional summary"
                currentValue={state.summary}
                onResult={(v) => set('summary', v)}
              />
            </AccordionSection>

            <AccordionSection title="Work Experience">
              {state.workExperience.map((exp) => (
                <ItemCard
                  key={exp.id}
                  title={exp.jobTitle || 'New Position'}
                  onRemove={() => delExp(exp.id)}
                >
                  <EditorInput
                    label="Company Name"
                    value={exp.companyName}
                    onChange={(v) => updExp(exp.id, 'companyName', v)}
                    placeholder="Company ABC"
                  />
                  <EditorInput
                    label="Job Title"
                    value={exp.jobTitle}
                    onChange={(v) => updExp(exp.id, 'jobTitle', v)}
                    placeholder="MERN Stack Developer"
                  />
                  <div className="space-y-3">
                    <DatePicker
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(v) => updExp(exp.id, 'startDate', v)}
                    />
                    <DatePicker
                      label="End Date"
                      value={exp.endDate}
                      onChange={(v) => updExp(exp.id, 'endDate', v)}
                    />
                  </div>
                  <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => updExp(exp.id, 'isCurrent', e.target.checked)}
                      className="accent-primary"
                    />
                    Currently working here
                  </label>
                  <EditorTextarea
                    label="Details"
                    value={exp.details}
                    onChange={(v) => updExp(exp.id, 'details', v)}
                    placeholder="• Developed scalable web applications&#10;• Improved performance by 30%"
                    rows={4}
                  />
                  <AIPromptBar
                    context={`work experience as ${exp.jobTitle} at ${exp.companyName}`}
                    currentValue={exp.details}
                    onResult={(v) => updExp(exp.id, 'details', v)}
                  />
                </ItemCard>
              ))}
              <AddBtn label="Add Experience" onClick={addExp} />
            </AccordionSection>

            <AccordionSection title="Skills and Languages">
              {state.skillGroups.map((group) => (
                <div key={group.id} className="border-border mb-2 rounded border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Skills</span>
                    <button
                      onClick={() =>
                        set(
                          'skillGroups',
                          state.skillGroups.filter((g) => g.id !== group.id)
                        )
                      }
                      className="text-muted-foreground hover:text-danger"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <EditorInput
                    label="Category"
                    value={group.category}
                    onChange={(v) =>
                      set(
                        'skillGroups',
                        state.skillGroups.map((g) =>
                          g.id === group.id ? { ...g, category: v } : g
                        )
                      )
                    }
                    placeholder="DevOps Tools"
                  />
                  <label className="label mt-2">Skills</label>
                  <div className="flex gap-2">
                    <input
                      value={skillInputs[group.id] || ''}
                      onChange={(e) =>
                        setSkillInputs((p) => ({
                          ...p,
                          [group.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && addSkill(group.id)}
                      placeholder="Type and press Enter…"
                      className="input bg-background flex-1"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {group.skills.map((s) => (
                      <span
                        key={s}
                        className="bg-primary-light text-primary flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs"
                      >
                        {s}
                        <button onClick={() => delSkill(group.id, s)}>
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <AddBtn label="Add Skill Category" onClick={addSkillGroup} />
              <div className="border-border mt-2 rounded border p-3">
                <label className="label mb-2 block">Languages</label>
                <div className="flex gap-2">
                  <input
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && langInput.trim()) {
                        set('languages', [...state.languages, langInput.trim()]);
                        setLangInput('');
                      }
                    }}
                    placeholder="English, Hindi…"
                    className="input bg-background flex-1"
                  />
                  <button
                    onClick={() => {
                      if (langInput.trim()) {
                        set('languages', [...state.languages, langInput.trim()]);
                        setLangInput('');
                      }
                    }}
                    className="btn btn-sm btn-primary h-10.25 px-2.5"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {state.languages.map((l) => (
                    <span
                      key={l}
                      className="bg-primary-light text-primary flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs"
                    >
                      {l}
                      <button
                        onClick={() =>
                          set(
                            'languages',
                            state.languages.filter((x) => x !== l)
                          )
                        }
                      >
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Projects">
              {state.projects.map((proj) => (
                <ItemCard
                  key={proj.id}
                  title={proj.title || 'New Project'}
                  onRemove={() => delProj(proj.id)}
                >
                  <EditorInput
                    label="Project Title"
                    value={proj.title}
                    onChange={(v) => updProj(proj.id, 'title', v)}
                    placeholder="Real-Time Chat App"
                  />
                  <EditorInput
                    label="Project URL"
                    value={proj.url}
                    onChange={(v) => updProj(proj.id, 'url', v)}
                    placeholder="https://github.com/…"
                  />
                  <EditorInput
                    label="Organization"
                    value={proj.organization}
                    onChange={(v) => updProj(proj.id, 'organization', v)}
                    placeholder="Personal / Company"
                  />
                  <div className="space-y-3">
                    <DatePicker
                      label="Start Date"
                      value={proj.startDate}
                      onChange={(v) => updProj(proj.id, 'startDate', v)}
                    />
                    <DatePicker
                      label="End Date"
                      value={proj.endDate}
                      onChange={(v) => updProj(proj.id, 'endDate', v)}
                    />
                  </div>
                  <EditorTextarea
                    label="Details"
                    value={proj.details}
                    onChange={(v) => updProj(proj.id, 'details', v)}
                    placeholder="• Built using WebSockets&#10;• Tech: Node.js, React, MongoDB"
                    rows={4}
                  />
                  <AIPromptBar
                    context={`project: ${proj.title}`}
                    currentValue={proj.details}
                    onResult={(v) => updProj(proj.id, 'details', v)}
                  />
                </ItemCard>
              ))}
              <AddBtn label="Add Project" onClick={addProj} />
            </AccordionSection>

            <AccordionSection title="Education">
              {state.education.map((edu) => (
                <ItemCard
                  key={edu.id}
                  title={edu.degree || 'New Education'}
                  onRemove={() => delEdu(edu.id)}
                >
                  <EditorInput
                    label="Institute"
                    value={edu.institution}
                    onChange={(v) => updEdu(edu.id, 'institution', v)}
                    placeholder="University of Technology"
                  />
                  <EditorInput
                    label="Degree"
                    value={edu.degree}
                    onChange={(v) => updEdu(edu.id, 'degree', v)}
                    placeholder="B.Tech in CS"
                  />
                  <EditorInput
                    label="Field of Study"
                    value={edu.organization}
                    onChange={(v) => updEdu(edu.id, 'organization', v)}
                    placeholder="Computer Science"
                  />
                  <div className="space-y-3">
                    <DatePicker
                      label="Start Date"
                      value={edu.startDate}
                      onChange={(v) => updEdu(edu.id, 'startDate', v)}
                    />
                    <DatePicker
                      label="End Date"
                      value={edu.endDate}
                      onChange={(v) => updEdu(edu.id, 'endDate', v)}
                    />
                  </div>
                  <EditorTextarea
                    label="Details"
                    value={edu.details}
                    onChange={(v) => updEdu(edu.id, 'details', v)}
                    placeholder="• Relevant coursework: Data Structures, Algorithms…"
                    rows={3}
                  />
                  <AIPromptBar
                    context={`education: ${edu.degree}`}
                    currentValue={edu.details}
                    onResult={(v) => updEdu(edu.id, 'details', v)}
                  />
                </ItemCard>
              ))}
              <AddBtn label="Add Education" onClick={addEdu} />
            </AccordionSection>

            <AccordionSection title="Certifications">
              {state.certificates.map((cert, i) => (
                <div key={cert.id} className="border-border mb-2 rounded border">
                  <div className="bg-muted flex items-center justify-between rounded-t-lg px-3 py-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      Certificate {i + 1}
                    </span>
                    <button
                      onClick={() =>
                        set(
                          'certificates',
                          state.certificates.filter((c) => c.id !== cert.id)
                        )
                      }
                      className="text-muted-foreground hover:text-danger"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="space-y-2 rounded-b-lg p-3">
                    <EditorInput
                      label="Certificate Name"
                      value={cert.name}
                      onChange={(v) => updCert(cert.id, 'name', v)}
                      placeholder="AWS Cloud Practitioner"
                    />
                    <EditorInput
                      label="Certificate URL"
                      value={cert.url}
                      onChange={(v) => updCert(cert.id, 'url', v)}
                      placeholder="https://credly.com/…"
                    />
                  </div>
                </div>
              ))}
              <AddBtn label="Add Certificate" onClick={addCert} />
            </AccordionSection>

            <AccordionSection title="Hobbies">
              <EditorTextarea
                value={state.hobbies}
                onChange={(v) => set('hobbies', v)}
                placeholder="Reading, Traveling, Open Source Contributing…"
                rows={2}
              />
            </AccordionSection>
          </div>
        </div>

        <div
          className={`flex-1 overflow-y-auto bg-[hsl(var(--surface-raised))] py-4 lg:px-5 print:bg-white print:p-0 ${mobilePanel === 'editor' ? 'hidden lg:block' : 'block'}`}
        >
          <div
            ref={previewRef}
            style={{ border: '1px solid #e5e7eb' }}
            className="mx-auto max-w-198.5 overflow-hidden rounded bg-white print:rounded-none print:shadow-none"
          >
            <ResumePreview data={state} />
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs print:hidden">
            Use <strong>Download</strong> to save as PDF · <strong>Save</strong> adds it to your
            Resumes library
          </p>
        </div>
      </div>
    </div>
  );
}

type Tab = 'resumes' | 'builder';

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumes', label: 'My Resumes' },
  { id: 'builder', label: 'Resume Builder' },
];

export default function ResumesPage() {
  useAuthGuard('CANDIDATE');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'resumes');

  const setTab = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  return (
    <div className={`mx-auto max-w-5xl space-y-5`}>
      <PageHeader title="Resumes" description="Manage your resumes and build new ones with AI" />

      <div className="bg-muted flex w-fit gap-1 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`transition-micro cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumes' && <MyResumesTab />}
      {activeTab === 'builder' && <ResumeBuilderTab />}
    </div>
  );
}
