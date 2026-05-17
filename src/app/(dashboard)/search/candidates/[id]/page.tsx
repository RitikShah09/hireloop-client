'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/axios';
import {
  ChevronLeft,
  MapPin,
  Github,
  Linkedin,
  Globe,
  FileText,
  Briefcase,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, Badge, Avatar, Skeleton } from '@/components/ui';

interface CandidateDetail {
  id: string;
  firstName: string;
  lastName: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  user: { email: string; createdAt: string };
  resumes: Array<{ fileName: string; fileUrl: string; createdAt: string }>;
  _count: { applications: number };
}

export default function CandidateDetailPage() {
  useAuthGuard('COMPANY');
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['candidate-detail', id],
    queryFn: async () => {
      const res = await api.get(`/search/candidates/${id}`);
      return res.data.data as CandidateDetail;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-5 w-32" />
        <Card>
          <div className="flex gap-5">
            <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="text-muted-foreground py-12 text-center">Candidate not found</Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/search/candidates"
        className="text-muted-foreground hover:text-foreground transition-micro inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft size={15} />
        Back to Search
      </Link>

      <Card>
        <div className="flex items-start gap-5">
          <Avatar
            src={data.avatarUrl}
            name={`${data.firstName} ${data.lastName}`}
            size="xl"
            className="shrink-0 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-foreground text-xl font-bold">
              {data.firstName} {data.lastName}
            </h1>
            <div className="text-muted-foreground mt-1.5 flex flex-wrap gap-3 text-sm">
              {data.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {data.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Joined{' '}
                {formatDistanceToNow(new Date(data.user.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {data._count.applications} application
                {data._count.applications !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {data.linkedinUrl && (
                <a
                  href={data.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-light text-primary hover:bg-primary-muted border-primary/20 transition-micro flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
                >
                  <Linkedin size={12} />
                  LinkedIn <ExternalLink size={10} />
                </a>
              )}
              {data.githubUrl && (
                <a
                  href={data.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-muted text-foreground hover:bg-border border-border transition-micro flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
                >
                  <Github size={12} />
                  GitHub <ExternalLink size={10} />
                </a>
              )}
              {data.portfolioUrl && (
                <a
                  href={data.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-success-light text-success border-success/20 transition-micro flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs hover:opacity-80"
                >
                  <Globe size={12} />
                  Portfolio <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {data.bio && (
            <Card>
              <h2 className="text-foreground mb-2 font-semibold">About</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{data.bio}</p>
            </Card>
          )}

          {data.resumes.length > 0 && (
            <Card>
              <h2 className="text-foreground mb-3 font-semibold">Resume</h2>
              <div className="space-y-2">
                {data.resumes.map((r, i) => (
                  <a
                    key={i}
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-border border-border transition-micro flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="bg-danger-light flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <FileText size={16} className="text-danger" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">{r.fileName}</p>
                      <p className="text-muted-foreground text-xs">
                        Uploaded{' '}
                        {formatDistanceToNow(new Date(r.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <ExternalLink size={13} className="text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {data.skills.length > 0 && (
            <Card>
              <h2 className="text-foreground mb-3 font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s) => (
                  <Badge key={s} variant="primary" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-foreground mb-2 font-semibold">Contact</h2>
            <p className="text-foreground text-sm break-all">{data.user.email}</p>
            <p className="text-muted-foreground mt-1 text-xs">Candidate email</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
