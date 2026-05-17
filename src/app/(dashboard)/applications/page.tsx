'use client';

import { useState } from 'react';
import { useApplications } from '@/hooks/useApi';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Brain,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Application } from '@/services/api';
import { Card, Badge, Button, Avatar, PageHeader, EmptyState, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  string,
  {
    label: string;
    variant: 'neutral' | 'warning' | 'info' | 'success' | 'danger';
    icon: React.ElementType;
  }
> = {
  PENDING: { label: 'Under Review', variant: 'neutral', icon: Clock },
  SCREENING: { label: 'AI Screening', variant: 'info', icon: Brain },
  SHORTLISTED: { label: 'Shortlisted', variant: 'success', icon: CheckCircle },
  REJECTED: { label: 'Not Selected', variant: 'danger', icon: XCircle },
  HIRED: { label: 'Hired', variant: 'info', icon: Trophy },
};

function AIInsights({ app }: { app: Application }) {
  const score = app.aiScore!;
  const barColor = score >= 75 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-danger';
  const textColor = score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger';
  const label = score >= 75 ? 'Strong match' : score >= 50 ? 'Moderate match' : 'Low match';

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Match breakdown</span>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-xs font-semibold', textColor)}>{label}</span>
            <span className={cn('text-xs font-bold', textColor)}>{score}/100</span>
          </div>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {app.aiStrengths?.length > 0 && (
        <div>
          <p className="text-success mb-1.5 flex items-center gap-1 text-xs font-medium">
            <ThumbsUp size={11} />
            Your strengths for this role
          </p>
          <ul className="space-y-1">
            {app.aiStrengths.slice(0, 3).map((s, i) => (
              <li key={i} className="text-muted-foreground flex items-start gap-1.5 text-xs">
                <span className="text-success mt-0.5 shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {app.aiWeaknesses?.length > 0 && (
        <div>
          <p className="text-warning mb-1.5 flex items-center gap-1 text-xs font-medium">
            <ThumbsDown size={11} />
            Areas to improve
          </p>
          <ul className="space-y-1">
            {app.aiWeaknesses.slice(0, 2).map((w, i) => (
              <li key={i} className="text-muted-foreground flex items-start gap-1.5 text-xs">
                <span className="text-warning mt-0.5 shrink-0">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const config = statusConfig[app.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;
  const hasInsights = app.aiScore !== null && app.aiScore !== undefined;
  const [insightsOpen, setInsightsOpen] = useState(false);

  return (
    <Card hover>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={app.job?.company?.logoUrl}
            name={app.job?.company?.name || app.job?.title || 'Company'}
            size="md"
            className="shrink-0 rounded-lg"
          />
          <div>
            <h3 className="text-foreground font-semibold">{app.job?.title}</h3>
            <p className="text-muted-foreground text-sm">{app.job?.company?.name}</p>
            {app.job?.location && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                <MapPin size={10} />
                {app.job.location}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant={config.variant} dot>
            <StatusIcon size={10} className="mr-1" />
            {config.label}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {hasInsights && (
        <div className="border-border mt-4 border-t pt-4">
          <button
            onClick={() => setInsightsOpen((o) => !o)}
            className="group flex w-full cursor-pointer items-center justify-between text-left"
          >
            <span className="text-primary flex items-center gap-1.5 text-xs font-medium">
              <Brain size={12} />
              AI Match Insights · {app.aiScore}/100
            </span>
            <ChevronDown
              size={14}
              className={cn(
                'text-muted-foreground transition-transform duration-200',
                insightsOpen && 'rotate-180'
              )}
            />
          </button>

          {insightsOpen && (
            <div className="mt-3">
              <AIInsights app={app} />
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Link href={`/jobs/${app.jobId}`}>
          <Button variant="ghost" size="sm">
            View Job
          </Button>
        </Link>
      </div>
    </Card>
  );
}

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  useAuthGuard('CANDIDATE');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useApplications({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  const apps = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? apps.length;

  const summary = Object.entries(statusConfig)
    .map(([status, { label, variant }]) => ({
      status,
      label,
      variant,
      count: apps.filter((a) => a.status === status).length,
    }))
    .filter((s) => s.count > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="My Applications"
        description={`${total} application${total !== 1 ? 's' : ''} submitted`}
      />

      {summary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.map(({ status, label, variant, count }) => (
            <Badge
              key={status}
              variant={variant as 'neutral' | 'warning' | 'info' | 'success' | 'danger'}
            >
              {label}: {count}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={36} />}
          title={page > 1 ? 'No more applications' : 'No applications yet'}
          description="Browse jobs and submit your first application"
          action={
            page > 1 ? (
              <Button variant="ghost" onClick={() => setPage(1)}>
                Back to first page
              </Button>
            ) : (
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-muted-foreground text-xs">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="text-muted-foreground px-1 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={cn(
                      'transition-micro h-8 w-8 cursor-pointer rounded text-sm font-medium',
                      page === p
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
