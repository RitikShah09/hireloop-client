'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useJob,
  useResumes,
  useApplyToJob,
  useCandidateApplications,
  useCompanyProfile,
} from '@/hooks/useApi';
import { useAppSelector } from '@/store/hooks';
import { applyJobSchema, ApplyJobFormData } from '@/validators';
import {
  MapPin,
  Wifi,
  Calendar,
  Briefcase,
  ChevronLeft,
  Send,
  FileText,
  IndianRupee,
  CheckCircle,
  Share2,
  Pencil,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, Badge, Button, Avatar, Skeleton, Textarea, CustomSelect } from '@/components/ui';
import { LoginModal } from '@/components/LoginModal';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const isCandidate = user?.role === 'CANDIDATE';
  const isCompany = user?.role === 'COMPANY';

  const { data: jobData, isLoading } = useJob(id);
  const { data: resumesData } = useResumes(isAuthenticated && isCandidate);
  const { data: appsData } = useCandidateApplications(isCandidate);
  const { data: companyProfile } = useCompanyProfile(isAuthenticated && isCompany);
  const { mutate: apply, isPending: applying } = useApplyToJob();

  const job = jobData?.data;
  const isOwner =
    isCompany && !!companyProfile?.data?.id && job?.companyId === companyProfile.data.id;
  const resumes = resumesData?.data || [];
  const [showApply, setShowApply] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const alreadyApplied = isCandidate && (appsData?.data || []).some((a) => a.jobId === id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplyJobFormData>({
    resolver: zodResolver(applyJobSchema),
  });

  const onApply = (data: ApplyJobFormData) => {
    apply(
      { jobId: id, resumeId: data.resumeId, coverLetter: data.coverLetter },
      {
        onSuccess: () => {
          setShowApply(false);
          toast.success('Application submitted!');
          router.push('/applications');
        },
      }
    );
  };

  const handleShareJob = () => {
    const shareUrl = job?.shareableSlug
      ? `${window.location.origin}/jobs/${job.shareableSlug}`
      : window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Skeleton className="h-6 w-32" />
        <Card>
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-3">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">Job not found</p>
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
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        href="/jobs"
        className="text-muted-foreground hover:text-foreground transition-micro inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft size={15} />
        Back to Jobs
      </Link>

      <Card>
        <div className="flex items-start gap-3">
          <Avatar
            src={job.company?.logoUrl}
            name={job.company?.name || job.title}
            size="md"
            className="shrink-0 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-foreground text-lg leading-tight font-bold">{job.title}</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">{job.company?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareJob}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted transition-micro rounded p-1.5"
                  title="Share job"
                >
                  <Share2 size={15} />
                </button>
                <Badge variant={job.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                  {job.status}
                </Badge>
              </div>
            </div>

            <div className="text-muted-foreground mt-3 flex flex-wrap gap-3 text-sm">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {job.location}
                </span>
              )}
              {job.isRemote && (
                <span className="text-success flex items-center gap-1">
                  <Wifi size={13} />
                  Remote
                </span>
              )}
              {job.salaryMin && (
                <span className="flex items-center gap-1">
                  <IndianRupee size={13} />
                  {(job.salaryMin / 100000).toFixed(1)}–
                  {((job.salaryMax || job.salaryMin) / 100000).toFixed(1)}L
                </span>
              )}
              {job.experienceMin != null && job.experienceMax != null && (
                <span className="flex items-center gap-1">
                  <Briefcase size={13} />
                  {job.experienceMin}–{job.experienceMax} yrs exp
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                Posted{' '}
                {formatDistanceToNow(new Date(job.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {isOwner ? (
          <div className="border-border mt-5 flex flex-wrap items-center gap-2 border-t pt-5">
            <Link href={`/jobs/${job.id}/edit`}>
              <Button leftIcon={<Pencil size={14} />}>Edit Job</Button>
            </Link>
            <Link href={`/jobs/${job.id}/candidates`}>
              <Button variant="outline" leftIcon={<Users size={14} />}>
                View Applicants
              </Button>
            </Link>
          </div>
        ) : job.status === 'ACTIVE' && !isCandidate ? (
          !isAuthenticated && (
            <div className="border-border mt-5 flex items-center gap-3 border-t pt-5">
              <Button onClick={() => setShowLogin(true)}>Apply Now</Button>
            </div>
          )
        ) : (
          isCandidate &&
          job.status === 'ACTIVE' && (
            <div className="border-border mt-5 border-t pt-5">
              {alreadyApplied ? (
                <div className="text-success flex items-center gap-2 text-sm font-medium">
                  <CheckCircle size={16} />
                  You&apos;ve already applied to this job
                </div>
              ) : (
                <Button
                  leftIcon={showApply ? undefined : <Send size={14} />}
                  variant={showApply ? 'ghost' : 'primary'}
                  onClick={() => setShowApply(!showApply)}
                >
                  {showApply ? 'Cancel' : 'Apply Now'}
                </Button>
              )}
            </div>
          )
        )}
      </Card>

      {showApply && isCandidate && !alreadyApplied && (
        <Card className="border-primary/30">
          <h2 className="text-foreground mb-4 font-semibold">Submit Application</h2>
          <form onSubmit={handleSubmit(onApply)} className="space-y-4">
            {resumes.length === 0 ? (
              <div className="bg-warning-light border-warning/20 text-warning flex items-center gap-2 rounded border p-3 text-sm">
                <FileText size={15} />
                No resumes uploaded.{' '}
                <Link href="/resumes" className="font-medium underline">
                  Upload one first
                </Link>
              </div>
            ) : (
              <CustomSelect
                label="Select Resume *"
                placeholder="Choose a resume..."
                value={watch('resumeId') || ''}
                onChange={(val) => setValue('resumeId', val, { shouldValidate: true })}
                options={resumes.map((r) => ({
                  value: r.id,
                  label: r.fileName + (r.isDefault ? ' (Default)' : ''),
                }))}
                error={errors.resumeId?.message}
              />
            )}

            <div>
              <label className="label">
                Cover Letter <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                {...register('coverLetter')}
                rows={5}
                placeholder="Tell the company why you're a great fit..."
                error={errors.coverLetter?.message}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                isLoading={applying}
                disabled={resumes.length === 0}
                leftIcon={<CheckCircle size={14} />}
              >
                Submit Application
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowApply(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <h2 className="text-foreground mb-3 font-semibold">Job Description</h2>
            <p className="text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-wrap">
              {job.description}
            </p>
          </Card>

          {job.requirements.length > 0 && (
            <Card>
              <h2 className="text-foreground mb-3 font-semibold">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-foreground mb-3 text-sm font-semibold">Skills Required</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <Badge key={s} variant="primary" className="text-[11px]">
                  {s}
                </Badge>
              ))}
            </div>
          </Card>

          {job.closingDate && (
            <Card>
              <h3 className="text-foreground mb-1 text-sm font-semibold">Application Deadline</h3>
              <p className="text-muted-foreground text-sm">
                {new Date(job.closingDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </Card>
          )}

          <Card>
            <h3 className="text-foreground mb-2 text-sm font-semibold">Share this Job</h3>
            <button
              onClick={handleShareJob}
              className="text-primary flex items-center gap-2 text-sm hover:underline"
            >
              <Share2 size={13} />
              Copy shareable link
            </button>
            <p className="text-muted-foreground mt-1.5 text-xs">
              Anyone with this link can view the job details
            </p>
          </Card>
        </div>
      </div>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowApply(true);
        }}
      />
    </div>
  );
}
