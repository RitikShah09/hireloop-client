'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCandidateProfile,
  useUpdateCandidateProfile,
  useCompanyProfile,
  useUpdateCompanyProfile,
  useCertifications,
  useAddCertification,
  useDeleteCertification,
  useUpdateCertification,
  useWorkExperience,
  useAddExperience,
  useDeleteExperience,
  useUpdateExperience,
  useEducation,
  useAddEducation,
  useDeleteEducation,
  useUpdateEducation,
  useMilestones,
  useAddMilestone,
  useDeleteMilestone,
  useUpdateMilestone,
} from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/api';
import { queryKeys } from '@/hooks/useApi';
import {
  candidateProfileSchema,
  companyProfileSchema,
  CandidateProfileFormData,
  CompanyProfileFormData,
} from '@/validators';
import {
  Camera,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  Card,
  Button,
  Input,
  Textarea,
  Badge,
  Avatar,
  PageHeader,
  Skeleton,
  Modal,
  CustomSelect,
  ConfirmDialog,
} from '@/components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function CandidateProfileForm() {
  const { data, isPending: isLoadingProfile, isError, refetch } = useCandidateProfile();
  const { mutate: update, isPending } = useUpdateCandidateProfile();
  const qc = useQueryClient();
  const avatarRef = useRef<HTMLInputElement>(null);
  const profile = data?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateProfileFormData>({
    resolver: zodResolver(candidateProfileSchema),

    values: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      phone: profile?.phone ?? '',
      location: profile?.location ?? '',
      bio: profile?.bio ?? '',
      skills: profile?.skills?.join(', ') ?? '',
      linkedinUrl: profile?.linkedinUrl ?? '',
      githubUrl: profile?.githubUrl ?? '',
      portfolioUrl: profile?.portfolioUrl ?? '',
    },
  });

  const { mutate: uploadAvatar, isPending: uploadingAvatar } = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.candidate });
      toast.success('Avatar updated');
    },
  });

  const onSubmit = (data: CandidateProfileFormData) => {
    update({
      ...data,
      skills: data.skills
        ? data.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    });
  };

  if (isLoadingProfile)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );

  if (isError)
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-foreground font-medium">Failed to load profile</p>
          <p className="text-muted-foreground text-sm">
            There was an error fetching your profile. Please try again.
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </Card>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              src={profile?.avatarUrl}
              name={`${profile?.firstName} ${profile?.lastName}`}
              size="xl"
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="bg-primary hover:bg-primary-hover transition-micro absolute -right-1.5 -bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
            >
              {uploadingAvatar ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Camera size={12} />
              )}
            </button>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
              }}
            />
          </div>
          <div>
            <p className="text-foreground font-semibold">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-muted-foreground text-sm">
              Click the camera icon to update your photo
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-foreground mb-4 font-semibold">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Phone" placeholder="+91 XXXXX XXXXX" {...register('phone')} />
            <Input label="Location" placeholder="e.g. Pune, India" {...register('location')} />
          </div>
          <Textarea
            label="Bio"
            rows={3}
            placeholder="Tell employers about yourself..."
            {...register('bio')}
            error={errors.bio?.message}
          />
          <Input
            label="Skills"
            placeholder="React, Node.js, TypeScript..."
            hint="Comma-separated list of skills"
            {...register('skills')}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-foreground mb-4 font-semibold">Links</h2>
        <div className="space-y-3">
          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/in/username"
            leftIcon={<Linkedin size={14} />}
            error={errors.linkedinUrl?.message}
            {...register('linkedinUrl')}
          />
          <Input
            label="GitHub"
            placeholder="https://github.com/username"
            leftIcon={<Github size={14} />}
            error={errors.githubUrl?.message}
            {...register('githubUrl')}
          />
          <Input
            label="Portfolio"
            placeholder="https://yourportfolio.com"
            leftIcon={<Globe size={14} />}
            error={errors.portfolioUrl?.message}
            {...register('portfolioUrl')}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isPending} size="lg">
          Save Profile
        </Button>
      </div>
    </form>
  );
}

const emptyCert = { name: '', issuer: '', issueDate: '', credentialUrl: '' };

function CertificationSection() {
  const { data, isLoading } = useCertifications();
  const { mutate: add, isPending: adding } = useAddCertification();
  const { mutate: update, isPending: updating } = useUpdateCertification();
  const { mutate: remove } = useDeleteCertification();
  const certs = data?.data || [];
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<(typeof certs)[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCert);

  const openEdit = (c: (typeof certs)[0]) => {
    setEditItem(c);
    setForm({
      name: c.name,
      issuer: c.issuer || '',
      issueDate: c.issueDate ? c.issueDate.slice(0, 7) : '',
      credentialUrl: c.credentialUrl || '',
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    add(
      { ...form, issueDate: form.issueDate ? form.issueDate + '-01' : '' },
      {
        onSuccess: () => {
          setAddOpen(false);
          setForm(emptyCert);
        },
      }
    );
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    update(
      {
        id: editItem.id,
        data: {
          ...form,
          issueDate: form.issueDate ? form.issueDate + '-01' : '',
        },
      },
      { onSuccess: () => setEditItem(null) }
    );
  };

  const CertForm = ({
    onSubmit,
    isPending,
    submitLabel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        label="Certification Name"
        required
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Input
        label="Issuer"
        required
        value={form.issuer}
        onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
      />
      <Input
        label="Issue Date"
        type="month"
        value={form.issueDate}
        onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
      />
      <Input
        label="Credential URL"
        type="url"
        placeholder="https://"
        value={form.credentialUrl}
        onChange={(e) => setForm((f) => ({ ...f, credentialUrl: e.target.value }))}
      />
      <div className="flex gap-2 pt-1">
        <Button type="submit" isLoading={isPending} className="flex-1">
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setAddOpen(false);
            setEditItem(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-muted-foreground" />
          <h2 className="text-foreground font-semibold">Certifications</h2>
          {certs.length > 0 && <Badge variant="neutral">{certs.length}</Badge>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => {
            setForm(emptyCert);
            setAddOpen(true);
          }}
        >
          Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : certs.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No certifications added yet
        </p>
      ) : (
        <div className="space-y-3">
          {certs.map((c) => (
            <div
              key={c.id}
              className="bg-muted flex items-start justify-between gap-3 rounded-lg p-3"
            >
              <div>
                <p className="text-foreground text-sm font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">{c.issuer}</p>
                {c.issueDate && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {format(new Date(c.issueDate), 'MMM yyyy')}
                  </p>
                )}
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-1 flex items-center gap-1 text-xs hover:underline"
                  >
                    <LinkIcon size={10} />
                    View credential
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => openEdit(c)}
                  className="text-muted-foreground hover:text-primary p-1 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="text-muted-foreground hover:text-danger p-1 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Certification" size="sm">
        <CertForm onSubmit={handleAdd} isPending={adding} submitLabel="Add Certification" />
      </Modal>
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Certification"
        size="sm"
      >
        <CertForm onSubmit={handleEdit} isPending={updating} submitLabel="Save Changes" />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            remove(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete certification"
        description="Are you sure you want to remove this certification from your profile?"
      />
    </Card>
  );
}

const emptyExp = {
  company: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
};

function WorkExperienceSection() {
  const { data, isLoading } = useWorkExperience();
  const { mutate: add, isPending: adding } = useAddExperience();
  const { mutate: update, isPending: updating } = useUpdateExperience();
  const { mutate: remove } = useDeleteExperience();
  const exps = data?.data || [];
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<(typeof exps)[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyExp);

  const openEdit = (exp: (typeof exps)[0]) => {
    setEditItem(exp);
    setForm({
      company: exp.company,
      role: exp.role,
      location: exp.location || '',
      startDate: exp.startDate ? exp.startDate.slice(0, 7) : '',
      endDate: exp.endDate ? exp.endDate.slice(0, 7) : '',
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
    });
  };

  const buildPayload = () => ({
    ...form,
    startDate: form.startDate + '-01',
    endDate: form.isCurrent ? undefined : form.endDate ? form.endDate + '-01' : undefined,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    add(buildPayload(), {
      onSuccess: () => {
        setAddOpen(false);
        setForm(emptyExp);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    update({ id: editItem.id, data: buildPayload() }, { onSuccess: () => setEditItem(null) });
  };

  const ExpForm = ({
    onSubmit,
    isPending,
    submitLabel,
    onCancel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    submitLabel: string;
    onCancel: () => void;
  }) => (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Company"
          required
          value={form.company}
          onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
        />
        <Input
          label="Role / Title"
          required
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
        />
      </div>
      <Input
        label="Location"
        placeholder="Optional"
        value={form.location}
        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="month"
          required
          value={form.startDate}
          onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
        />
        {!form.isCurrent && (
          <Input
            label="End Date"
            type="month"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isCurrent}
          onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked }))}
          className="rounded"
        />
        Currently working here
      </label>
      <Textarea
        label="Description"
        rows={2}
        placeholder="Key responsibilities..."
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <div className="flex gap-2 pt-1">
        <Button type="submit" isLoading={isPending} className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-muted-foreground" />
          <h2 className="text-foreground font-semibold">Work Experience</h2>
          {exps.length > 0 && <Badge variant="neutral">{exps.length}</Badge>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => {
            setForm(emptyExp);
            setAddOpen(true);
          }}
        >
          Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : exps.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No work experience added yet
        </p>
      ) : (
        <div className="space-y-3">
          {exps.map((exp) => (
            <div
              key={exp.id}
              className="bg-muted flex items-start justify-between gap-3 rounded-lg p-3"
            >
              <div>
                <p className="text-foreground text-sm font-medium">{exp.role}</p>
                <p className="text-muted-foreground text-xs">
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ''}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {format(new Date(exp.startDate), 'MMM yyyy')} –{' '}
                  {exp.isCurrent
                    ? 'Present'
                    : exp.endDate
                      ? format(new Date(exp.endDate), 'MMM yyyy')
                      : ''}
                </p>
                {exp.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {exp.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => openEdit(exp)}
                  className="text-muted-foreground hover:text-primary p-1 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setDeleteId(exp.id)}
                  className="text-muted-foreground hover:text-danger p-1 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Work Experience">
        <ExpForm
          onSubmit={handleAdd}
          isPending={adding}
          submitLabel="Add Experience"
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Work Experience">
        <ExpForm
          onSubmit={handleEdit}
          isPending={updating}
          submitLabel="Save Changes"
          onCancel={() => setEditItem(null)}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            remove(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete experience"
        description="Are you sure you want to remove this work experience from your profile?"
      />
    </Card>
  );
}

const emptyEdu = {
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  grade: '',
};

function EducationSection() {
  const { data, isLoading } = useEducation();
  const { mutate: add, isPending: adding } = useAddEducation();
  const { mutate: update, isPending: updating } = useUpdateEducation();
  const { mutate: remove } = useDeleteEducation();
  const educations = data?.data || [];
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<(typeof educations)[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEdu);

  const openEdit = (edu: (typeof educations)[0]) => {
    setEditItem(edu);
    setForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field || '',
      startDate: edu.startDate ? edu.startDate.slice(0, 7) : '',
      endDate: edu.endDate ? edu.endDate.slice(0, 7) : '',
      isCurrent: edu.isCurrent || false,
      grade: edu.grade || '',
    });
  };

  const buildPayload = () => ({
    ...form,
    startDate: form.startDate + '-01',
    endDate: form.isCurrent ? undefined : form.endDate ? form.endDate + '-01' : undefined,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    add(buildPayload(), {
      onSuccess: () => {
        setAddOpen(false);
        setForm(emptyEdu);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    update({ id: editItem.id, data: buildPayload() }, { onSuccess: () => setEditItem(null) });
  };

  const EduForm = ({
    onSubmit,
    isPending,
    submitLabel,
    onCancel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    submitLabel: string;
    onCancel: () => void;
  }) => (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        label="Institution"
        required
        value={form.institution}
        onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Degree"
          required
          placeholder="B.Tech, MBA..."
          value={form.degree}
          onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}
        />
        <Input
          label="Field of Study"
          placeholder="Computer Science..."
          value={form.field}
          onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="month"
          required
          value={form.startDate}
          onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
        />
        {!form.isCurrent && (
          <Input
            label="End Date"
            type="month"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isCurrent}
          onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked }))}
          className="rounded"
        />
        Currently studying
      </label>
      <Input
        label="Grade / CGPA"
        placeholder="Optional"
        value={form.grade}
        onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
      />
      <div className="flex gap-2 pt-1">
        <Button type="submit" isLoading={isPending} className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-muted-foreground" />
          <h2 className="text-foreground font-semibold">Education</h2>
          {educations.length > 0 && <Badge variant="neutral">{educations.length}</Badge>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => {
            setForm(emptyEdu);
            setAddOpen(true);
          }}
        >
          Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : educations.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">No education added yet</p>
      ) : (
        <div className="space-y-3">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="bg-muted flex items-start justify-between gap-3 rounded-lg p-3"
            >
              <div>
                <p className="text-foreground text-sm font-medium">
                  {edu.degree}
                  {edu.field ? `, ${edu.field}` : ''}
                </p>
                <p className="text-muted-foreground text-xs">{edu.institution}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {format(new Date(edu.startDate), 'MMM yyyy')} –{' '}
                  {edu.isCurrent
                    ? 'Present'
                    : edu.endDate
                      ? format(new Date(edu.endDate), 'MMM yyyy')
                      : ''}
                  {edu.grade && ` · ${edu.grade}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => openEdit(edu)}
                  className="text-muted-foreground hover:text-primary p-1 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setDeleteId(edu.id)}
                  className="text-muted-foreground hover:text-danger p-1 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Education">
        <EduForm
          onSubmit={handleAdd}
          isPending={adding}
          submitLabel="Add Education"
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Education">
        <EduForm
          onSubmit={handleEdit}
          isPending={updating}
          submitLabel="Save Changes"
          onCancel={() => setEditItem(null)}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            remove(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete education"
        description="Are you sure you want to remove this education entry from your profile?"
      />
    </Card>
  );
}

const emptyMilestone = { title: '', description: '', date: '' };

function MilestoneSection() {
  const { data, isLoading } = useMilestones();
  const { mutate: add, isPending: adding } = useAddMilestone();
  const { mutate: update, isPending: updating } = useUpdateMilestone();
  const { mutate: remove } = useDeleteMilestone();
  const milestones = data?.data || [];
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<(typeof milestones)[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyMilestone);

  const openEdit = (m: (typeof milestones)[0]) => {
    setEditItem(m);
    setForm({
      title: m.title,
      description: m.description || '',
      date: m.date ? m.date.slice(0, 10) : '',
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    add(form, {
      onSuccess: () => {
        setAddOpen(false);
        setForm(emptyMilestone);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    update({ id: editItem.id, data: form }, { onSuccess: () => setEditItem(null) });
  };

  const MilestoneForm = ({
    onSubmit,
    isPending,
    submitLabel,
    onCancel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    submitLabel: string;
    onCancel: () => void;
  }) => (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        label="Title"
        required
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      <Textarea
        label="Description"
        rows={2}
        placeholder="Optional details..."
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <Input
        label="Date"
        type="date"
        required
        value={form.date}
        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
      />
      <div className="flex gap-2 pt-1">
        <Button type="submit" isLoading={isPending} className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-muted-foreground" />
          <h2 className="text-foreground font-semibold">Milestones</h2>
          {milestones.length > 0 && <Badge variant="neutral">{milestones.length}</Badge>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => {
            setForm(emptyMilestone);
            setAddOpen(true);
          }}
        >
          Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : milestones.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">No milestones added yet</p>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="bg-muted flex items-start justify-between gap-3 rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                <div>
                  <p className="text-foreground text-sm font-medium">{m.title}</p>
                  {m.description && (
                    <p className="text-muted-foreground text-xs">{m.description}</p>
                  )}
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {format(new Date(m.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => openEdit(m)}
                  className="text-muted-foreground hover:text-primary p-1 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setDeleteId(m.id)}
                  className="text-muted-foreground hover:text-danger p-1 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Milestone" size="sm">
        <MilestoneForm
          onSubmit={handleAdd}
          isPending={adding}
          submitLabel="Add Milestone"
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Milestone" size="sm">
        <MilestoneForm
          onSubmit={handleEdit}
          isPending={updating}
          submitLabel="Save Changes"
          onCancel={() => setEditItem(null)}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            remove(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete milestone"
        description="Are you sure you want to remove this milestone from your profile?"
      />
    </Card>
  );
}

function CompanyProfileForm() {
  const { data, isPending: isLoadingProfile } = useCompanyProfile();
  const { mutate: update, isPending } = useUpdateCompanyProfile();
  const qc = useQueryClient();
  const logoRef = useRef<HTMLInputElement>(null);
  const profile = data?.data;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    values: {
      name: profile?.name ?? '',
      description: profile?.description ?? '',
      website: profile?.website ?? '',
      industry: profile?.industry ?? '',
      size: profile?.size ?? '',
      location: profile?.location ?? '',
    },
  });

  const { mutate: uploadLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: (file: File) => profileApi.uploadLogo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.company });
      toast.success('Logo updated');
    },
  });

  if (isLoadingProfile)
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );

  return (
    <form onSubmit={handleSubmit((d) => update(d))} className="space-y-5">
      <Card>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              src={profile?.logoUrl}
              name={profile?.name || 'C'}
              size="xl"
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              className="bg-primary hover:bg-primary-hover transition-micro absolute -right-1.5 -bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
            >
              {uploadingLogo ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Camera size={12} />
              )}
            </button>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadLogo(f);
              }}
            />
          </div>
          <div>
            <p className="text-foreground font-semibold">{profile?.name}</p>
            <p className="text-muted-foreground text-sm">
              Click the camera icon to update your logo
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-foreground mb-4 font-semibold">Company Information</h2>
        <div className="space-y-4">
          <Input label="Company Name" error={errors.name?.message} {...register('name')} />
          <Textarea
            label="Description"
            rows={4}
            placeholder="Tell candidates about your company..."
            {...register('description')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Industry"
              placeholder="e.g. Software, Fintech"
              {...register('industry')}
            />
            <CustomSelect
              label="Company Size"
              value={watch('size') || ''}
              placeholder="Select company size"
              onChange={(value) => setValue('size', value)}
              options={[
                { value: '1-10', label: '1-10 employees' },
                { value: '11-50', label: '11-50 employees' },
                { value: '51-200', label: '51-200 employees' },
                { value: '201-500', label: '201-500 employees' },
                { value: '500+', label: '500+ employees' },
              ]}
              error={errors.size?.message}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Location" placeholder="e.g. Pune, India" {...register('location')} />
            <Input
              label="Website"
              type="url"
              placeholder="https://yourcompany.com"
              error={errors.website?.message}
              {...register('website')}
            />
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" isLoading={isPending} size="lg">
          Save Profile
        </Button>
      </div>
    </form>
  );
}

type ProfileTab = 'profile' | 'experience' | 'education' | 'certifications' | 'milestones';

const candidateTabs: { id: ProfileTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'milestones', label: 'Milestones' },
];

export default function ProfilePage() {
  const { user } = useAuthGuard();
  const isCompany = user?.role === 'COMPANY';
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<ProfileTab>(
    (searchParams.get('tab') as ProfileTab) || 'profile'
  );

  const setTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  if (isCompany) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <PageHeader
          title="Company Profile"
          description="Manage your company's public information"
        />
        <CompanyProfileForm />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="My Profile" description="Manage your professional information" />

      <div className="bg-muted flex gap-1 overflow-x-auto rounded-lg p-1">
        {candidateTabs.map((tab) => (
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

      <div className="animate-fade-in">
        {activeTab === 'profile' && <CandidateProfileForm />}
        {activeTab === 'experience' && <WorkExperienceSection />}
        {activeTab === 'education' && <EducationSection />}
        {activeTab === 'certifications' && <CertificationSection />}
        {activeTab === 'milestones' && <MilestoneSection />}
      </div>
    </div>
  );
}
