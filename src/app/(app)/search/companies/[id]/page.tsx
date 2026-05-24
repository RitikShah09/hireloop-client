'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/axios';
import {
  ChevronLeft,
  MapPin,
  Globe,
  Users,
  Briefcase,
  Wifi,
  ChevronRight,
  ExternalLink,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, Badge, Button, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CompanyDetail {
  company: {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    industry?: string;
    size?: string;
    location?: string;
    website?: string;
    createdAt: string;
  };
  jobs: Array<{
    id: string;
    title: string;
    location?: string;
    isRemote: boolean;
    salaryMin?: number;
    salaryMax?: number;
    skills: string[];
    experienceMin?: number;
    experienceMax?: number;
    status: string;
    createdAt: string;
    closingDate?: string;
  }>;
  jobsMeta: { page: number; limit: number; total: number; totalPages: number };
}

const jobStatusVariant: Record<string, 'success' | 'neutral' | 'danger' | 'warning'> = {
  ACTIVE: 'success',
  DRAFT: 'neutral',
  CLOSED: 'danger',
  ARCHIVED: 'neutral',
};

export default function CompanyDetailPage() {
  useAuthGuard('CANDIDATE');
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['company-detail', id, page],
    queryFn: async () => {
      const res = await api.get(`/search/companies/${id}?page=${page}&limit=6`);
      return res.data.data as CompanyDetail;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Skeleton className="h-5 w-36" />
        <Card>
          <div className="flex gap-5">
            <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="text-muted-foreground py-12 text-center">Company not found</Card>
      </div>
    );
  }

  const { company: c, jobs, jobsMeta } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        href="/search/companies"
        className="text-muted-foreground hover:text-foreground transition-micro inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft size={15} />
        Back to Companies
      </Link>

      <Card>
        <div className="flex items-start gap-5">
          <Avatar src={c.logoUrl} name={c.name} size="xl" className="shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-foreground text-xl font-bold">{c.name}</h1>
                {c.industry && (
                  <p className="text-primary mt-0.5 text-sm font-medium">{c.industry}</p>
                )}
              </div>
              {c.website && (
                <a href={c.website} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Globe size={13} />}
                    rightIcon={<ExternalLink size={11} />}
                  >
                    Visit Website
                  </Button>
                </a>
              )}
            </div>
            <div className="text-muted-foreground mt-3 flex flex-wrap gap-4 text-sm">
              {c.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {c.location}
                </span>
              )}
              {c.size && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} />
                  {c.size} employees
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                On HireLoop{' '}
                {formatDistanceToNow(new Date(c.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {c.description && (
          <div className="border-border mt-5 border-t pt-5">
            <h2 className="text-foreground mb-2 font-semibold">About</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{c.description}</p>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-title">
            Open Positions
            {jobsMeta.total > 0 && (
              <span className="text-muted-foreground ml-2 font-normal">
                ({jobsMeta.total} active)
              </span>
            )}
          </p>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={36} />}
            title="No open positions right now"
            description="Check back later for new opportunities"
          />
        ) : (
          jobs.map((job) => (
            <Card key={job.id} hover>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-foreground min-w-0 font-semibold wrap-break-word">
                  {job.title}
                </h3>
                <Badge variant={jobStatusVariant[job.status] ?? 'neutral'} dot className="shrink-0">
                  {job.status}
                </Badge>
              </div>

              <div className="text-muted-foreground mt-1.5 flex flex-wrap gap-3 text-sm">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {job.location}
                  </span>
                )}
                {job.isRemote && (
                  <span className="text-success flex items-center gap-1">
                    <Wifi size={12} />
                    Remote
                  </span>
                )}
                {job.salaryMin && (
                  <span className="flex items-center gap-1">
                    <IndianRupee size={12} />
                    {(job.salaryMin / 100000).toFixed(1)}–
                    {((job.salaryMax || job.salaryMin) / 100000).toFixed(1)}L
                  </span>
                )}
                {job.experienceMin != null && job.experienceMax != null && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} />
                    {job.experienceMin}–{job.experienceMax} yrs
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.skills.slice(0, 6).map((s) => (
                  <Badge key={s} variant="primary" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
                {job.skills.length > 6 && (
                  <Badge variant="neutral" className="text-[10px]">
                    +{job.skills.length - 6}
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                <p className="text-muted-foreground text-xs">
                  Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </p>
                {job.closingDate && (
                  <p className="text-muted-foreground text-xs">
                    Closes {formatDistanceToNow(new Date(job.closingDate), { addSuffix: true })}
                  </p>
                )}
              </div>

              <div className="border-border xs:justify-end mt-4 flex border-t pt-3">
                <Link href={`/jobs/${job.id}`} className="xs:w-auto w-full">
                  <Button className="xs:w-auto w-full" size="sm">
                    Apply
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}

        {jobsMeta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={13} />}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            {Array.from({ length: jobsMeta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'transition-micro h-9 w-9 rounded-lg border text-sm font-medium',
                  p === page
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                {p}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight size={13} />}
              disabled={page === jobsMeta.totalPages}
              onClick={() => setPage((p) => Math.min(jobsMeta.totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
