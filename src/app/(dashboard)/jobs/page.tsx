'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import {
  useJobs,
  useMyJobs,
  useDeleteJob,
  useUpdateJob,
  useCandidateApplications,
  useSuggestedJobs,
} from '@/hooks/useApi';
import {
  Briefcase,
  MapPin,
  Wifi,
  Plus,
  Trash2,
  Eye,
  Users,
  Search,
  IndianRupee,
  Clock,
  CheckCircle,
  Lightbulb,
  Star,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Job } from '@/services/api';
import {
  Card,
  Badge,
  Button,
  PageHeader,
  EmptyState,
  Skeleton,
  Avatar,
  ConfirmDialog,
} from '@/components/ui';
import { cn } from '@/lib/utils';

function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'success' | 'neutral' | 'danger' | 'warning'> = {
    ACTIVE: 'success',
    DRAFT: 'neutral',
    CLOSED: 'danger',
    ARCHIVED: 'neutral',
  };
  return (
    <Badge variant={map[status] ?? 'neutral'} dot>
      {status}
    </Badge>
  );
}

function JobCard({
  job,
  isCompany,
  alreadyApplied,
  onDelete,
  onToggleStatus,
}: {
  job: Job;
  isCompany: boolean;
  alreadyApplied?: boolean;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, status: string) => void;
}) {
  return (
    <Card hover className="transition-smooth group">
      <div className="flex items-start gap-4">
        <Avatar
          src={job.company?.logoUrl}
          name={job.company?.name || job.title}
          size="md"
          className="shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground mb-0.5 truncate text-xs">{job.company?.name}</p>
              <h3 className="text-foreground leading-tight font-semibold">{job.title}</h3>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <JobStatusBadge status={job.status} />
              <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                {formatDistanceToNow(new Date(job.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-xs">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {job.location}
              </span>
            )}
            {job.isRemote && (
              <span className="text-success flex items-center gap-1">
                <Wifi size={11} />
                Remote
              </span>
            )}
            {job.salaryMin && (
              <span className="flex items-center gap-1">
                <IndianRupee size={11} />
                {(job.salaryMin / 100000).toFixed(1)}–
                {((job.salaryMax || job.salaryMin) / 100000).toFixed(1)}L
              </span>
            )}
            {job.closingDate && !isCompany && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                Closes{' '}
                {formatDistanceToNow(new Date(job.closingDate), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="primary" className="text-[10px]">
                {s}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="neutral" className="text-[10px]">
                +{job.skills.length - 5}
              </Badge>
            )}
          </div>

          <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
            {isCompany ? (
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Users size={13} />
                {job._count?.applications || 0} applicants
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">
                {job.experienceMin !== undefined
                  ? `${job.experienceMin}–${job.experienceMax}y exp`
                  : 'Any experience'}
              </span>
            )}

            <div className="flex items-center gap-2">
              {isCompany ? (
                <>
                  <Link href={`/jobs/${job.id}/candidates`}>
                    <Button variant="outline" size="sm" leftIcon={<Eye size={12} />}>
                      View Applicants
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onToggleStatus?.(job.id, job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE')
                    }
                  >
                    {job.status === 'ACTIVE' ? 'Close' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(job.id)}
                    className="text-danger hover:text-danger hover:bg-danger/10 p-1.5"
                  >
                    <Trash2 size={13} />
                  </Button>
                </>
              ) : alreadyApplied ? (
                <>
                  <span className="text-success flex items-center gap-1.5 text-xs font-medium">
                    <CheckCircle size={13} />
                    Applied
                  </span>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/jobs/${job.id}`}>
                  <Button size="sm">View & Apply</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SuggestedJobCard({ job }: { job: Job & { matchScore?: number } }) {
  return (
    <Card hover>
      <div className="flex items-start gap-4">
        <Avatar
          src={job.company?.logoUrl}
          name={job.company?.name || job.title}
          size="md"
          className="shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground mb-0.5 truncate text-xs">{job.company?.name}</p>
              <h3 className="text-foreground leading-tight font-semibold">{job.title}</h3>
            </div>
            {job.matchScore !== undefined && job.matchScore > 0 && (
              <div className="flex shrink-0 items-center gap-1">
                <Star size={11} className="text-warning fill-warning" />
                <span className="text-warning text-xs font-semibold">{job.matchScore} match</span>
              </div>
            )}
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-xs">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {job.location}
              </span>
            )}
            {job.isRemote && (
              <span className="text-success flex items-center gap-1">
                <Wifi size={11} />
                Remote
              </span>
            )}
            {job.salaryMin && (
              <span className="flex items-center gap-1">
                <IndianRupee size={11} />
                {(job.salaryMin / 100000).toFixed(1)}–
                {((job.salaryMax || job.salaryMin) / 100000).toFixed(1)}L
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="primary" className="text-[10px]">
                {s}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="neutral" className="text-[10px]">
                +{job.skills.length - 5}
              </Badge>
            )}
          </div>
          <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(job.createdAt), {
                addSuffix: true,
              })}
            </span>
            <Link href={`/jobs/${job.id}`}>
              <Button size="sm">View & Apply</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function JobsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const isCompany = user?.role === 'COMPANY';
  const isCandidate = user?.role === 'CANDIDATE';
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = (searchParams.get('tab') as 'all' | 'suggested') || 'all';
  const setActiveTab = (tab: 'all' | 'suggested') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState('1');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: publicJobsData, isLoading: loadingPublic } = useJobs({
    page,
    search: debouncedSearch,
  });
  const { data: myJobsData, isLoading: loadingMine } = useMyJobs({ page });
  const { data: appsData } = useCandidateApplications(isCandidate);
  const { data: suggestedData, isLoading: loadingSuggested } = useSuggestedJobs();
  const { mutate: deleteJob } = useDeleteJob();
  const { mutate: updateJob } = useUpdateJob();

  const appliedJobIds = new Set((appsData?.data || []).map((a) => a.jobId));

  const jobs = isCompany ? myJobsData?.data : publicJobsData?.data;
  const meta = isCompany ? myJobsData?.meta : publicJobsData?.meta;
  const isLoading = isCompany ? loadingMine : loadingPublic;

  const handlePageChange = useCallback((p: number) => {
    setPage(String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const suggestedJobs = (suggestedData?.data || []) as (Job & {
    matchScore?: number;
  })[];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title={isCompany ? 'My Job Postings' : 'Browse Jobs'}
        description={isCompany ? `${meta?.total ?? 0} jobs posted` : 'Find your next opportunity'}
        actions={
          isCompany ? (
            <Link href="/jobs/new">
              <Button leftIcon={<Plus size={15} />}>Post New Job</Button>
            </Link>
          ) : undefined
        }
      />

      {isCandidate && (
        <div className="bg-muted flex w-fit gap-1 rounded-lg p-1">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'suggested', label: 'Suggested for You' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'suggested')}
              className={`transition-micro rounded-md px-4 py-1.5 text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {isCandidate && activeTab === 'suggested' && (
        <>
          <div className="bg-primary-light flex items-center gap-2 rounded-lg p-3">
            <Lightbulb size={16} className="text-primary shrink-0" />
            <p className="text-primary text-sm">
              Jobs matched to your skills. Update your profile to get better recommendations.
            </p>
          </div>
          {loadingSuggested ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-1.5 pt-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : suggestedJobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={40} />}
              title="No suggestions yet"
              description="Add skills to your profile to start receiving job recommendations."
              action={
                <Link href="/profile">
                  <Button>Update Profile</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {suggestedJobs.map((job) => (
                <SuggestedJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </>
      )}

      {(!isCandidate || activeTab === 'all') && (
        <>
          {!isCompany && (
            <div className="relative">
              <Search
                size={15}
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage('1');
                }}
                placeholder="Search by title, skill, company..."
                className="input pl-9"
              />
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-5 w-56" />
                      <Skeleton className="h-3 w-48" />
                      <div className="flex gap-1.5 pt-1">
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !jobs?.length ? (
            <EmptyState
              icon={<Briefcase size={40} />}
              title={isCompany ? 'No jobs posted yet' : 'No jobs found'}
              description={
                isCompany
                  ? 'Post your first job to start receiving applications.'
                  : 'Try adjusting your search or browse all available jobs.'
              }
              action={
                isCompany ? (
                  <Link href="/jobs/new">
                    <Button leftIcon={<Plus size={15} />}>Post Your First Job</Button>
                  </Link>
                ) : search ? (
                  <Button variant="secondary" onClick={() => setSearch('')}>
                    Clear Search
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isCompany={isCompany}
                  alreadyApplied={isCandidate && appliedJobIds.has(job.id)}
                  onDelete={(id) => setDeleteJobId(id)}
                  onToggleStatus={(id, status) =>
                    updateJob({
                      id,
                      data: {
                        status: status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE',
                      } as Partial<Job>,
                    })
                  }
                />
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-1.5 pt-2">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={cn(
                    'transition-micro h-8 w-8 rounded-lg text-sm font-medium',
                    String(p) === page
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground border-border hover:bg-muted border'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={() => {
          if (deleteJobId) {
            deleteJob(deleteJobId);
            setDeleteJobId(null);
          }
        }}
        title="Delete job posting"
        description="Are you sure you want to delete this job? All applications for this job will also be removed."
      />
    </div>
  );
}
