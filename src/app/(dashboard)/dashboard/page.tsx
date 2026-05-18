'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { useApplicationStats, useSuggestedJobs } from '@/hooks/useApi';
import {
  FileText,
  CheckCircle,
  Clock,
  Brain,
  Briefcase,
  ArrowRight,
  Sparkles,
  Users,
  BarChart2,
} from 'lucide-react';
import { StatCard, Card, Badge, PageHeader, EmptyState, Skeleton } from '@/components/ui';

import { Job } from '@/services/api';

function SuggestedJobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="card-hover transition-smooth overflow-hidden rounded-none border-x-0 border-t-0 p-4 first:border-b-0">
        <div className="flex items-start gap-3">
          {job.company?.logoUrl ? (
            <img
              src={job.company.logoUrl}
              alt={job.company.name}
              className="h-9 w-9 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="bg-primary-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Briefcase size={14} className="text-primary" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">{job.title}</p>
            <p className="text-muted-foreground truncate text-xs">{job.company?.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {job.skills.slice(0, 3).map((s) => (
                <Badge key={s} variant="primary" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <ArrowRight size={14} className="text-muted-foreground mt-0.5 shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { data: statsData, isLoading: statsLoading } = useApplicationStats();
  const { data: suggestedData, isLoading: suggestedLoading } = useSuggestedJobs();
  const stats = statsData?.data;
  const suggestedJobs = suggestedData?.data?.slice(0, 4) || [];

  const isCompany = user?.role === 'COMPANY';
  const displayName = isCompany
    ? user?.companyName || user?.email?.split('@')[0]
    : user?.firstName || user?.email?.split('@')[0];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={`${greeting}, ${displayName}`}
        description={
          isCompany ? "Here's your hiring pipeline overview" : 'Track your job search progress'
        }
      />

      <div className="xs:grid-cols-2 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card space-y-2 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Total"
              value={stats?.total ?? 0}
              icon={<FileText size={16} />}
              color="text-primary bg-primary-light"
            />
            <StatCard
              label="Pending"
              value={stats?.pending ?? 0}
              icon={<Clock size={16} />}
              color="text-warning bg-warning-light"
            />
            <StatCard
              label="Shortlisted"
              value={stats?.shortlisted ?? 0}
              icon={<CheckCircle size={16} />}
              color="text-success bg-success-light"
            />
            <StatCard
              label="Hired"
              value={stats?.hired ?? 0}
              icon={isCompany ? <Users size={16} /> : <CheckCircle size={16} />}
              color="text-info bg-info-light"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-primary relative overflow-hidden rounded-lg p-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white" />
              <div className="absolute -bottom-12 -left-4 h-48 w-48 rounded-full bg-white" />
            </div>
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                {isCompany ? (
                  <Brain size={18} className="text-white opacity-80" />
                ) : (
                  <Sparkles size={18} className="text-white opacity-80" />
                )}
                <span className="text-sm font-medium text-white/80">
                  {isCompany ? 'AI Recruiter' : 'AI Job Match'}
                </span>
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-white">
                {isCompany ? 'Chat with your candidate pool' : 'Find jobs tailored to your skills'}
              </h3>
              <p className="mb-5 text-sm text-white/70">
                {isCompany
                  ? 'Ask questions like "Who is the best Node.js candidate?" and get instant AI answers.'
                  : "Our AI analyzes your profile and matches you to roles you'll love."}
              </p>
              <Link
                href={isCompany ? '/ai-chat' : '/ai-search'}
                className="text-primary hover:bg-primary-light transition-micro inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold"
              >
                {isCompany ? 'Open AI Chat' : 'Try AI Search'}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {isCompany && stats && (
            <Card className="mt-4">
              <div className="mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-muted-foreground" />
                <h3 className="text-foreground text-sm font-medium">Pipeline Overview</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Screening',
                    value: stats.screening ?? 0,
                    variant: 'primary' as const,
                  },
                  {
                    label: 'Shortlisted',
                    value: stats.shortlisted,
                    variant: 'success' as const,
                  },
                  {
                    label: 'Hired',
                    value: stats.hired,
                    variant: 'info' as const,
                  },
                ].map(({ label, value, variant }) => (
                  <div key={label} className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-foreground text-xl font-semibold">{value}</p>
                    <Badge variant={variant} className="mt-1 text-[10px]">
                      {label}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {!isCompany && (
          <div>
            <Card padding="none" className="overflow-hidden">
              <div className="border-border flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-foreground text-sm font-medium">Suggested for you</h3>
                <Link href="/jobs?tab=suggested" className="text-primary text-xs hover:underline">
                  See all
                </Link>
              </div>
              <div className="divide-border divide-y">
                {suggestedLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 p-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))
                ) : suggestedJobs.length === 0 ? (
                  <EmptyState
                    title="No suggestions yet"
                    description="Complete your profile to get personalized job matches"
                  />
                ) : (
                  suggestedJobs.map((job) => <SuggestedJobCard key={job.id} job={job} />)
                )}
              </div>
            </Card>
          </div>
        )}

        {isCompany && (
          <div>
            <Card>
              <h3 className="text-foreground mb-3 text-sm font-medium">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { href: '/jobs/new', label: 'Post New Job', icon: Briefcase },
                  {
                    href: '/search/candidates',
                    label: 'Search Candidates',
                    icon: Users,
                  },
                  {
                    href: '/analytics',
                    label: 'View Analytics',
                    icon: BarChart2,
                  },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="bg-muted hover:bg-primary-light hover:text-primary transition-micro text-muted-foreground flex items-center gap-3 rounded-lg p-3 text-sm"
                  >
                    <Icon size={15} />
                    {label}
                    <ArrowRight size={13} className="ml-auto" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
