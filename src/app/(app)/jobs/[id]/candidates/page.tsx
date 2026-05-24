'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useJob,
  useApplications,
  useUpdateApplicationStatus,
  useScheduleInterview,
} from '@/hooks/useApi';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  ChevronLeft,
  User,
  Brain,
  CheckCircle,
  XCircle,
  Trophy,
  FileText,
  Linkedin,
  ChevronDown,
  ChevronUp,
  MapPin,
  CalendarClock,
} from 'lucide-react';
import { Application } from '@/services/api';
import {
  Card,
  Badge,
  Button,
  Avatar,
  PageHeader,
  EmptyState,
  Skeleton,
  Modal,
  CustomSelect,
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

const ALL_STATUSES = ['PENDING', 'SCREENING', 'SHORTLISTED', 'REJECTED', 'HIRED'] as const;

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
            placeholder="Any preparation tips or agenda for the candidate..."
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

function CandidateCard({
  app,
  onStatus,
}: {
  app: Application;
  onStatus: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const canAct = !['REJECTED', 'HIRED'].includes(app.status);
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
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <MapPin size={10} />
              {app.candidate.location}
            </p>
          )}
          {(app.candidate?.skills?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {app.candidate!.skills.slice(0, 5).map((s) => (
                <Badge key={s} variant="neutral" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {app.aiScore !== null && app.aiScore !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <Brain size={12} className="text-primary shrink-0" />
          <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
            <div
              className={cn(
                'h-full rounded-full',
                app.aiScore >= 75 ? 'bg-success' : app.aiScore >= 50 ? 'bg-warning' : 'bg-danger'
              )}
              style={{ width: `${app.aiScore}%` }}
            />
          </div>
          <span
            className={cn(
              'w-6 text-right text-xs font-bold',
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

        {['SHORTLISTED', 'SCREENING', 'PENDING'].includes(app.status) && (
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
              onClick={() => onStatus(app.id, 'SHORTLISTED')}
            >
              Shortlist
            </Button>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<XCircle size={12} />}
              className="text-danger hover:text-danger hover:bg-danger-light"
              onClick={() => onStatus(app.id, 'REJECTED')}
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
            onClick={() => onStatus(app.id, 'HIRED')}
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
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}
      </div>

      {expanded && app.aiSummary && (
        <div className="bg-primary-light border-primary/20 mt-4 space-y-3 rounded border p-4">
          <p className="text-primary flex items-center gap-1.5 text-sm font-semibold">
            <Brain size={13} />
            AI Assessment
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

export default function JobCandidatesPage() {
  useAuthGuard('COMPANY');
  const { id } = useParams<{ id: string }>();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: jobData } = useJob(id);

  const { data: appsData, isLoading } = useApplications({ jobId: id });
  const { mutate: updateStatus } = useUpdateApplicationStatus();

  const job = jobData?.data;
  const allApps = appsData?.data || [];

  const counts = allApps.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const apps = statusFilter ? allApps.filter((a) => a.status === statusFilter) : allApps;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        href="/jobs"
        className="text-muted-foreground hover:text-foreground transition-micro inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft size={15} />
        Back to Jobs
      </Link>

      <PageHeader
        title={job?.title || 'Candidates'}
        description={`${apps.length} application${apps.length !== 1 ? 's' : ''} · AI-ranked by match score`}
      />

      {allApps.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={cn(
                'transition-micro rounded-sm border px-3 py-1 text-xs font-medium',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface text-muted-foreground border-border hover:border-primary/40'
              )}
            >
              {status}: {counts[status] || 0}
            </button>
          ))}
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-muted-foreground hover:text-foreground px-3 py-1 text-xs"
            >
              Clear ×
            </button>
          )}
        </div>
      )}

      {isLoading ? (
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
            <CandidateCard
              key={app.id}
              app={app}
              onStatus={(appId, status) => updateStatus({ id: appId, status })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
