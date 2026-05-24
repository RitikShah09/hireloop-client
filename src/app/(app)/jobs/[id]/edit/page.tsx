'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useJob, useUpdateJob, useCompanyProfile } from '@/hooks/useApi';
import { createJobSchema, CreateJobFormData } from '@/validators';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import type { Job } from '@/services/api';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { Card, Input, Textarea, Button, PageHeader, CustomSelect, Skeleton } from '@/components/ui';

function EditJobForm({ job }: { job: Job }) {
  const router = useRouter();
  const { mutate: updateJob, isPending } = useUpdateJob();

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(job.skills ?? []);
  const [skillsError, setSkillsError] = useState('');

  const [reqInput, setReqInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>(job.requirements ?? []);
  const [reqError, setReqError] = useState('');

  const [status, setStatus] = useState<string>(job.status ?? 'ACTIVE');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: job.title,
      description: job.description,
      location: job.location ?? '',
      isRemote: job.isRemote,
      salaryMin: job.salaryMin != null ? String(job.salaryMin) : '',
      salaryMax: job.salaryMax != null ? String(job.salaryMax) : '',
      experienceMin: job.experienceMin != null ? String(job.experienceMin) : '',
      experienceMax: job.experienceMax != null ? String(job.experienceMax) : '',
      closingDate: job.closingDate ? new Date(job.closingDate).toISOString().slice(0, 16) : '',
      status: job.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE',
    },
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillsError('');
    }
    setSkillInput('');
  };

  const addRequirement = () => {
    const r = reqInput.trim();
    if (r) {
      setRequirements([...requirements, r]);
      setReqError('');
    }
    setReqInput('');
  };

  const onSubmit = (data: CreateJobFormData) => {
    let valid = true;
    if (skills.length === 0) {
      setSkillsError('Add at least one skill');
      valid = false;
    }
    if (requirements.length === 0) {
      setReqError('Add at least one requirement');
      valid = false;
    }
    if (!valid) return;

    updateJob(
      {
        id: job.id,
        data: {
          title: data.title,
          description: data.description,
          requirements,
          skills,
          location: data.location || undefined,
          isRemote: data.isRemote,
          salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
          salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
          experienceMin: data.experienceMin ? parseInt(data.experienceMin) : undefined,
          experienceMax: data.experienceMax ? parseInt(data.experienceMax) : undefined,
          closingDate: data.closingDate ? new Date(data.closingDate).toISOString() : undefined,
          status,
        },
      },
      { onSuccess: () => router.push(`/jobs/${job.id}`) }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <h2 className="text-foreground mb-4 font-semibold">Basic Information</h2>
        <div className="space-y-4">
          <Input
            label="Job Title *"
            placeholder="e.g. Senior Full Stack Developer"
            error={errors.title?.message}
            {...register('title')}
          />
          <Textarea
            label="Job Description *"
            rows={6}
            placeholder="Describe the role, responsibilities, tech stack..."
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Location" placeholder="e.g. Pune, India" {...register('location')} />
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  {...register('isRemote')}
                  type="checkbox"
                  className="border-border accent-primary h-4 w-4 rounded"
                />
                <span className="text-foreground text-sm font-medium">Remote friendly</span>
              </label>
            </div>
          </div>
          <CustomSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'ACTIVE', label: 'Active (accepting applications)' },
              { value: 'DRAFT', label: 'Draft (hidden from candidates)' },
              { value: 'CLOSED', label: 'Closed (no longer accepting)' },
            ]}
            width="auto"
            className="min-w-65"
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-foreground mb-4 font-semibold">Compensation & Experience</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Min Salary (₹/year)"
              type="number"
              placeholder="e.g. 800000"
              min="0"
              error={errors.salaryMin?.message}
              {...register('salaryMin')}
            />
            <Input
              label="Max Salary (₹/year)"
              type="number"
              placeholder="e.g. 1500000"
              min="0"
              error={errors.salaryMax?.message}
              {...register('salaryMax')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Min Experience"
              type="number"
              placeholder="e.g. 2 years"
              min="0"
              error={errors.experienceMin?.message}
              {...register('experienceMin')}
            />
            <Input
              label="Max Experience"
              type="number"
              placeholder="e.g. 5 years"
              min="0"
              error={errors.experienceMax?.message}
              {...register('experienceMax')}
            />
          </div>
          <div>
            <label className="label">Application Closing Date</label>
            <input
              {...register('closingDate')}
              type="datetime-local"
              className="input w-full"
              style={{ colorScheme: 'light' }}
            />
            {errors.closingDate && <p className="form-error mt-1">{errors.closingDate.message}</p>}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-foreground mb-4 font-semibold">Required Skills *</h2>
        <div className="mb-3 flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="e.g. Node.js — press Enter or click +"
            className="input flex-1"
          />
          <Button type="button" onClick={addSkill} leftIcon={<Plus size={14} />} size="sm">
            Add
          </Button>
        </div>
        {skillsError && <p className="form-error mb-2">{skillsError}</p>}
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="bg-primary-light text-primary border-primary/20 flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
            >
              {s}
              <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-foreground mb-4 font-semibold">Requirements *</h2>
        <div className="mb-3 flex gap-2">
          <input
            value={reqInput}
            onChange={(e) => setReqInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            placeholder="e.g. 3+ years of Node.js experience"
            className="input flex-1"
          />
          <Button type="button" onClick={addRequirement} leftIcon={<Plus size={14} />} size="sm">
            Add
          </Button>
        </div>
        {reqError && <p className="form-error mb-2">{reqError}</p>}
        <ul className="space-y-2">
          {requirements.map((r, i) => (
            <li
              key={i}
              className="bg-muted text-foreground flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-primary">•</span>
                {r}
              </span>
              <button
                type="button"
                onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
              >
                <X size={13} className="text-muted-foreground hover:text-danger transition-micro" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isPending} size="lg">
          Save Changes
        </Button>
        <Link href={`/jobs/${job.id}`}>
          <Button type="button" variant="ghost" size="lg">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

export default function EditJobPage() {
  useAuthGuard('COMPANY');
  const { id } = useParams<{ id: string }>();

  const { data: jobData, isLoading } = useJob(id);
  const { data: companyProfile } = useCompanyProfile();

  const job = jobData?.data;
  const isOwner = !!companyProfile?.data?.id && job?.companyId === companyProfile.data.id;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-56" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!job || (companyProfile?.data?.id && !isOwner)) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">
            {!job ? 'Job not found' : "You don't have permission to edit this job"}
          </p>
          <Link href="/jobs">
            <Button className="mt-4" variant="ghost">
              Back to Jobs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/jobs/${id}`}
        className="text-muted-foreground hover:text-foreground transition-micro inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft size={15} />
        Back to Job
      </Link>

      <PageHeader title="Edit Job" description="Update the details of your job posting" />

      <EditJobForm job={job} />
    </div>
  );
}
