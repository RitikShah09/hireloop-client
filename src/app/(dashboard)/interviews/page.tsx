'use client';
import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useInterviews, useUpdateInterview, useRespondToInterview } from '@/hooks/useApi';
import { Interview } from '@/services/api';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { Card, Badge, Button, PageHeader, EmptyState, Skeleton, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const modeIcon: Record<string, React.ElementType> = {
  video: Video,
  phone: Phone,
  'in-person': MapPin,
};
const modeLabel: Record<string, string> = {
  video: 'Video Call',
  phone: 'Phone Call',
  'in-person': 'In Person',
};

function statusBadge(status: string) {
  const map: Record<string, 'warning' | 'success' | 'info' | 'danger' | 'neutral'> = {
    PENDING: 'warning',
    ACCEPTED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    REJECTED: 'neutral',
  };
  return (
    <Badge variant={map[status] ?? 'neutral'} dot>
      {status}
    </Badge>
  );
}

function InterviewCard({ interview, isCompany }: { interview: Interview; isCompany: boolean }) {
  const { mutate: updateInterview, isPending: updating } = useUpdateInterview();
  const { mutate: respond } = useRespondToInterview();
  const [respondingAction, setRespondingAction] = useState<'ACCEPTED' | 'REJECTED' | null>(null);

  const handleRespond = (status: 'ACCEPTED' | 'REJECTED') => {
    setRespondingAction(status);
    respond({ id: interview.id, status }, { onSettled: () => setRespondingAction(null) });
  };
  const date = new Date(interview.scheduledAt);
  const past = isPast(date);
  const app = interview.application as Interview['application'] & {
    job?: { title: string; company?: { name: string; logoUrl?: string } };
    candidate?: { firstName: string; lastName: string; avatarUrl?: string };
  };
  const ModeIcon = modeIcon[interview.mode] || Video;

  return (
    <Card className={cn('transition-smooth', past && 'opacity-70')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={isCompany ? app?.candidate?.avatarUrl : app?.job?.company?.logoUrl}
            name={
              isCompany
                ? `${app?.candidate?.firstName} ${app?.candidate?.lastName}`
                : app?.job?.company?.name || 'Company'
            }
            size="md"
            className="shrink-0 rounded-lg"
          />
          <div>
            <p className="text-foreground font-medium">
              {isCompany
                ? `${app?.candidate?.firstName} ${app?.candidate?.lastName}`
                : app?.job?.company?.name}
            </p>
            <p className="text-muted-foreground text-sm">{app?.job?.title}</p>
          </div>
        </div>
        {statusBadge(interview.status)}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="text-muted-foreground bg-muted flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs">
          <Calendar size={12} className="text-primary" />
          {format(date, 'EEE, d MMM yyyy')}
        </div>
        <div className="text-muted-foreground bg-muted flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs">
          <Clock size={12} className="text-primary" />
          {format(date, 'h:mm a')} · {interview.durationMins}min
        </div>
        <div className="text-muted-foreground bg-muted flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs">
          <ModeIcon size={12} className="text-primary" />
          {modeLabel[interview.mode] || interview.mode}
        </div>
        {!past && (
          <div className="text-muted-foreground bg-muted flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs">
            <Clock size={12} />
            {formatDistanceToNow(date, { addSuffix: true })}
          </div>
        )}
      </div>

      {interview.meetLink && (
        <a
          href={interview.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary mt-3 inline-flex items-center gap-1.5 text-sm hover:underline"
        >
          <ExternalLink size={13} />
          Join Meeting
        </a>
      )}

      {interview.notes && (
        <div className="bg-primary-light mt-3 rounded-lg p-3">
          <p className="text-muted-foreground text-xs">{interview.notes}</p>
        </div>
      )}

      {!past && interview.status === 'PENDING' && (
        <div className="border-border mt-4 flex items-center justify-end gap-2 border-t pt-3">
          {isCompany ? (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Ban size={12} />}
              isLoading={updating}
              onClick={() =>
                updateInterview({
                  id: interview.id,
                  data: { status: 'CANCELLED' } as Partial<Interview>,
                })
              }
            >
              Cancel Interview
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle size={12} />}
                isLoading={respondingAction === 'ACCEPTED'}
                disabled={respondingAction !== null}
                onClick={() => handleRespond('ACCEPTED')}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle size={12} />}
                isLoading={respondingAction === 'REJECTED'}
                disabled={respondingAction !== null}
                onClick={() => handleRespond('REJECTED')}
              >
                Decline
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

export default function InterviewsPage() {
  const { user } = useAuthGuard();
  const isCompany = user?.role === 'COMPANY';
  const [page, setPage] = useState(1);

  const { data, isLoading } = useInterviews({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  const interviews = (data?.data as Interview[] | undefined) ?? [];
  const meta = (data as unknown as { meta?: { total: number; totalPages: number } })?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? interviews.length;

  const upcoming = interviews.filter(
    (i) => isFuture(new Date(i.scheduledAt)) && i.status !== 'CANCELLED'
  );
  const past = interviews.filter(
    (i) => isPast(new Date(i.scheduledAt)) || i.status === 'CANCELLED'
  );

  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
        pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Interviews"
        description={
          isCompany
            ? 'Manage interview schedules for your candidates'
            : 'Your upcoming interview schedule'
        }
      />

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
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={36} />}
          title="No interviews yet"
          description={
            isCompany
              ? 'Schedule interviews from the candidates pipeline page'
              : 'Interviews will appear here when companies invite you'
          }
        />
      ) : (
        <>
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <section>
                <p className="section-title mb-3">Upcoming ({upcoming.length})</p>
                <div className="space-y-3">
                  {upcoming.map((i) => (
                    <InterviewCard key={i.id} interview={i} isCompany={isCompany} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <p className="section-title mb-3">Past & Cancelled ({past.length})</p>
                <div className="space-y-3">
                  {past.map((i) => (
                    <InterviewCard key={i.id} interview={i} isCompany={isCompany} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ChevronLeft size={14} />}
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                {pageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="text-muted-foreground px-2 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        'h-8 w-8 cursor-pointer rounded-lg text-sm font-medium transition-colors',
                        page === p
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ChevronRight size={14} />}
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
