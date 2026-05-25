'use client';

import { useState, useMemo } from 'react';
import {
  useMyJobs,
  useApplications,
  useUpdateApplicationStatus,
  useScheduleInterview,
} from '@/hooks/useApi';
import {
  CheckCircle,
  XCircle,
  User,
  ChevronDown,
  Brain,
  Trophy,
  FileText,
  Linkedin,
  CalendarClock,
} from 'lucide-react';
import Link from 'next/link';
import { Application } from '@/services/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  Card,
  Badge,
  Button,
  Avatar,
  PageHeader,
  EmptyState,
  Skeleton,
  CustomSelect,
  Modal,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const statusVariant: Record<string, 'neutral' | 'info' | 'success' | 'danger'> = {
  PENDING: 'neutral',
  SCREENING: 'info',
  SHORTLISTED: 'success',
  REJECTED: 'danger',
  HIRED: 'info',
};

const MODE_OPTIONS = [
  { value: 'VIDEO', label: 'Video Call' },
  { value: 'PHONE', label: 'Phone Call' },
  { value: 'IN_PERSON', label: 'In Person' },
];

function ScheduleInterviewModal({
  applicationId,
  candidateName,
  open,
  onClose,
}: {
  applicationId: string;
  candidateName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { mutate: schedule, isPending } = useScheduleInterview();
  const [form, setForm] = useState({
    scheduledAt: '',
    durationMins: '60',
    mode: 'VIDEO',
    meetLink: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scheduledAt) {
      toast.error('Please select a date and time');
      return;
    }
    schedule(
      {
        applicationId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMins: parseInt(form.durationMins) || 60,
        mode: form.mode,
        meetLink: form.meetLink || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({
            scheduledAt: '',
            durationMins: '60',
            mode: 'VIDEO',
            meetLink: '',
            notes: '',
          });
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={`Schedule Interview — ${candidateName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Date & Time *</label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            className="input w-full"
            style={{ colorScheme: 'light' }}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Duration (mins)</label>
            <input
              type="number"
              value={form.durationMins}
              onChange={(e) => setForm((f) => ({ ...f, durationMins: e.target.value }))}
              className="input"
              min="15"
              step="15"
            />
          </div>
          <CustomSelect
            label="Mode"
            value={form.mode}
            onChange={(val) => setForm((f) => ({ ...f, mode: val }))}
            options={MODE_OPTIONS}
          />
        </div>

        {form.mode === 'VIDEO' && (
          <div>
            <label className="label">Meet Link</label>
            <input
              type="url"
              value={form.meetLink}
              onChange={(e) => setForm((f) => ({ ...f, meetLink: e.target.value }))}
              placeholder="https://meet.google.com/..."
              className="input"
            />
          </div>
        )}

        <div>
          <label className="label">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Preparation tips or agenda for the candidate..."
            className="input resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending} leftIcon={<CalendarClock size={14} />}>
            Schedule Interview
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ApplicationCard({
  app,
  onUpdateStatus,
}: {
  app: Application;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const canAct = !['HIRED', 'REJECTED'].includes(app.status);
  const candidateName = `${app.candidate?.firstName ?? ''} ${app.candidate?.lastName ?? ''}`.trim();
  const profileHref = `/search/candidates/${app.candidateId}`;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Link href={profileHref} className="shrink-0">
          <Avatar
            src={app.candidate?.avatarUrl}
            name={candidateName}
            size="md"
            className="transition-opacity hover:opacity-80"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={profileHref}
              className="text-foreground hover:text-primary transition-micro truncate font-semibold hover:underline"
            >
              {candidateName || 'Candidate'}
            </Link>
            <Badge variant={statusVariant[app.status] || 'neutral'}>{app.status}</Badge>
          </div>
          {app.candidate?.location && (
            <p className="text-muted-foreground mt-0.5 text-xs">{app.candidate.location}</p>
          )}

          {app.aiScore !== null && app.aiScore !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <Brain size={11} className="text-primary shrink-0" />
              <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                <div
                  className={cn(
                    'h-full rounded-full',
                    app.aiScore >= 75
                      ? 'bg-success'
                      : app.aiScore >= 50
                        ? 'bg-warning'
                        : 'bg-danger'
                  )}
                  style={{ width: `${app.aiScore}%` }}
                />
              </div>
              <span
                className={cn(
                  'w-7 text-right text-xs font-semibold',
                  app.aiScore >= 75
                    ? 'text-success'
                    : app.aiScore >= 50
                      ? 'text-warning'
                      : 'text-danger'
                )}
              >
                {app.aiScore}
              </span>
            </div>
          )}

          {(app.candidate?.skills?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {app.candidate!.skills.slice(0, 4).map((s) => (
                <Badge key={s} variant="neutral" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-border mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        {app.resume && (
          <a href={app.resume.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" leftIcon={<FileText size={12} />}>
              Resume
            </Button>
          </a>
        )}
        {app.candidate?.linkedinUrl && (
          <a href={app.candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" leftIcon={<Linkedin size={12} />}>
              LinkedIn
            </Button>
          </a>
        )}

        {['PENDING', 'SCREENING', 'SHORTLISTED'].includes(app.status) && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CalendarClock size={12} />}
            onClick={() => setScheduleOpen(true)}
          >
            <span className="hidden sm:inline">Schedule </span>Interview
          </Button>
        )}

        {canAct && app.status !== 'SHORTLISTED' && (
          <>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<CheckCircle size={12} />}
              className="text-success hover:text-success hover:bg-success-light"
              onClick={() => onUpdateStatus(app.id, 'SHORTLISTED')}
            >
              Shortlist
            </Button>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<XCircle size={12} />}
              className="text-danger hover:text-danger hover:bg-danger-light"
              onClick={() => onUpdateStatus(app.id, 'REJECTED')}
            >
              Reject
            </Button>
          </>
        )}

        {app.status === 'SHORTLISTED' && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trophy size={12} />}
            className="text-primary hover:text-primary hover:bg-primary-light"
            onClick={() => onUpdateStatus(app.id, 'HIRED')}
          >
            Mark Hired
          </Button>
        )}

        {app.status === 'HIRED' && (
          <span className="text-success flex items-center gap-1 text-xs font-medium">
            <CheckCircle size={12} />
            Hired
          </span>
        )}

        {app.aiSummary && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary ml-auto flex items-center gap-1 text-xs hover:underline"
          >
            <Brain size={11} />
            AI Analysis
            <ChevronDown
              size={11}
              className={cn('transition-transform', expanded && 'rotate-180')}
            />
          </button>
        )}
      </div>

      {expanded && app.aiSummary && (
        <div className="bg-primary-light border-primary/20 mt-4 space-y-3 rounded border p-4">
          <p className="text-primary flex items-center gap-1.5 text-sm font-semibold">
            <Brain size={13} />
            AI Summary
          </p>
          <p className="text-foreground/80 text-sm leading-relaxed">{app.aiSummary}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(app.aiStrengths?.length ?? 0) > 0 && (
              <div>
                <p className="text-success mb-1.5 text-xs font-semibold">Strengths</p>
                <ul className="space-y-1">
                  {app.aiStrengths!.map((s, i) => (
                    <li key={i} className="text-foreground/70 flex gap-1.5 text-xs">
                      <span className="text-success shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(app.aiWeaknesses?.length ?? 0) > 0 && (
              <div>
                <p className="text-danger mb-1.5 text-xs font-semibold">Gaps</p>
                <ul className="space-y-1">
                  {app.aiWeaknesses!.map((w, i) => (
                    <li key={i} className="text-foreground/70 flex gap-1.5 text-xs">
                      <span className="text-danger shrink-0">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <ScheduleInterviewModal
        applicationId={app.id}
        candidateName={candidateName}
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
      />
    </Card>
  );
}

export default function CandidatesPage() {
  useAuthGuard('COMPANY');
  const { data: jobsData } = useMyJobs();
  const jobs = useMemo(() => jobsData?.data ?? [], [jobsData]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const effectiveJobId = selectedJobId || jobs[0]?.id || '';

  const { data: appsData, isLoading } = useApplications(
    effectiveJobId
      ? { jobId: effectiveJobId, ...(statusFilter && { status: statusFilter }) }
      : undefined
  );

  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const apps = appsData?.data || [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader title="Candidate Pipeline" description="AI-ranked candidates for your jobs" />

      <div className="flex flex-wrap gap-3">
        <CustomSelect
          value={effectiveJobId}
          onChange={setSelectedJobId}
          placeholder="Select a job..."
          options={[...jobs.map((j) => ({ value: j.id, label: j.title }))]}
          width="auto"
          className="xs:max-w-55 w-full"
        />
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { value: '', label: 'All statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'SCREENING', label: 'Screening' },
            { value: 'SHORTLISTED', label: 'Shortlisted' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'HIRED', label: 'Hired' },
          ]}
          width="auto"
          className="xs:max-w-35 w-full"
        />
      </div>

      {!effectiveJobId ? (
        <EmptyState
          icon={<User size={36} />}
          title="Select a job to see its candidates"
          description="Use the dropdown above to filter by job"
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<User size={36} />}
          title="No applications yet"
          description="Share the job link to attract candidates"
        />
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onUpdateStatus={(id, status) => updateStatus({ id, status })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
