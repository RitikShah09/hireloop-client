'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Briefcase, Users, CheckCircle, Trophy, TrendingUp, Brain, Clock } from 'lucide-react';
import { Card, PageHeader, StatCard, Skeleton } from '@/components/ui';

interface Analytics {
  overview: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApps: number;
    screeningApps: number;
    shortlistedApps: number;
    rejectedApps: number;
    hiredApps: number;
    hireRate: number;
  };
  applicationsByJob: Array<{ name: string; applications: number }>;
  applicationsOverTime: Array<{ date: string; applications: number }>;
  aiScoreByJob: Array<{ name: string; avgScore: number }>;
  funnel: Array<{ stage: string; count: number; fill: string }>;
  topSkills: Array<{ skill: string; count: number }>;
}

const CHART_STYLE = {
  contentStyle: {
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    fontSize: '12px',
    background: 'hsl(var(--surface))',
  },
  tickStyle: { fontSize: 10, fill: 'hsl(var(--foreground-subtle))' },
};

export default function AnalyticsPage() {
  useAuthGuard('COMPANY');

  const { data, isLoading } = useQuery({
    queryKey: ['company-analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/company');
      return res.data.data as Analytics;
    },
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="text-muted-foreground py-12 text-center">No analytics data available</Card>
      </div>
    );

  const { overview, applicationsByJob, applicationsOverTime, aiScoreByJob, funnel, topSkills } =
    data;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Your hiring pipeline performance at a glance"
      />

      <div className="xs:grid-cols-2 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard
          label="Total Jobs"
          value={overview.totalJobs}
          sub={`${overview.activeJobs} active`}
          icon={<Briefcase size={18} />}
          color="text-primary bg-primary-light"
        />
        <StatCard
          label="Applications"
          value={overview.totalApplications}
          sub={`${overview.pendingApps} pending review`}
          icon={<Users size={18} />}
          color="text-info bg-info-light"
        />
        <StatCard
          label="Shortlisted"
          value={overview.shortlistedApps}
          sub={`${overview.hiredApps} hired`}
          icon={<CheckCircle size={18} />}
          color="text-success bg-success-light"
        />
        <StatCard
          label="Hire Rate"
          value={`${overview.hireRate}%`}
          sub={`${overview.hiredApps} of ${overview.totalApplications} applicants`}
          icon={<Trophy size={18} />}
          color="text-warning bg-warning-light"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Pending',
            value: overview.pendingApps,
            cls: 'bg-muted text-muted-foreground',
          },
          {
            label: 'AI Screening',
            value: overview.screeningApps,
            cls: 'bg-info-light text-info',
          },
          {
            label: 'Shortlisted',
            value: overview.shortlistedApps,
            cls: 'bg-success-light text-success',
          },
          {
            label: 'Rejected',
            value: overview.rejectedApps,
            cls: 'bg-danger-light text-danger',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${s.cls}`}
          >
            <span className="text-sm font-medium">{s.label}</span>
            <span className="text-xl font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <TrendingUp size={16} className="text-primary" />
            Applications (Last 14 Days)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={CHART_STYLE.tickStyle} tickLine={false} />
              <YAxis tick={CHART_STYLE.tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CHART_STYLE.contentStyle} />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <Briefcase size={16} className="text-primary" />
            Applications by Job
          </h2>
          {applicationsByJob.length === 0 ? (
            <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
              No jobs yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={applicationsByJob} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={CHART_STYLE.tickStyle}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={CHART_STYLE.tickStyle}
                  tickLine={false}
                  width={90}
                />
                <Tooltip contentStyle={CHART_STYLE.contentStyle} />
                <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <Users size={16} className="text-primary" />
            Hiring Funnel
          </h2>
          <div className="space-y-3">
            {funnel.map((stage) => {
              const pct =
                funnel[0].count > 0 ? Math.round((stage.count / funnel[0].count) * 100) : 0;
              return (
                <div key={stage.stage}>
                  <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                    <span>{stage.stage}</span>
                    <span className="text-foreground font-semibold">
                      {stage.count} ({pct}%)
                    </span>
                  </div>
                  <div className="bg-muted h-5 overflow-hidden rounded-lg">
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{ width: `${pct}%`, backgroundColor: stage.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <Brain size={16} className="text-primary" />
            Avg AI Score by Job
          </h2>
          {aiScoreByJob.length === 0 ? (
            <div className="text-muted-foreground flex h-44 items-center justify-center text-sm">
              No screened candidates yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={aiScoreByJob}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={CHART_STYLE.tickStyle} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tick={CHART_STYLE.tickStyle}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={CHART_STYLE.contentStyle} />
                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                  {aiScoreByJob.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.avgScore >= 70
                          ? 'hsl(var(--success))'
                          : entry.avgScore >= 50
                            ? 'hsl(var(--warning))'
                            : 'hsl(var(--danger))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
            <Clock size={16} className="text-primary" />
            Top Skills You Hire For
          </h2>
          {topSkills.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Post jobs to see skills
            </p>
          ) : (
            <div className="space-y-2.5">
              {topSkills.map(({ skill, count }) => (
                <div key={skill} className="flex items-center gap-2">
                  <span className="text-foreground w-24 truncate text-xs">{skill}</span>
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / (topSkills[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-4 text-xs">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
