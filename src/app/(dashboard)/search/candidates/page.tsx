'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/axios';
import {
  Search,
  User,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, Badge, Button, Avatar, PageHeader, EmptyState, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Candidate {
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
  _count: { applications: number };
}

interface ApiResponse {
  data: Candidate[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default function CandidateSearchPage() {
  useAuthGuard('COMPANY');

  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    search: '',
    skills: '',
    location: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search-candidates', activeFilters, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (activeFilters.search) params.set('search', activeFilters.search);
      if (activeFilters.skills) params.set('skills', activeFilters.skills);
      if (activeFilters.location) params.set('location', activeFilters.location);
      const res = await api.get(`/search/candidates?${params}`);
      return res.data as ApiResponse;
    },
    enabled: submitted,
  });

  const handleSearch = () => {
    setActiveFilters({ search, skills, location });
    setPage(1);
    setSubmitted(true);
  };

  const clearFilter = (key: keyof typeof activeFilters) => {
    const updated = { ...activeFilters, [key]: '' };
    setActiveFilters(updated);
    if (key === 'search') setSearch('');
    if (key === 'skills') setSkills('');
    if (key === 'location') setLocation('');
  };

  const candidates = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Search Candidates"
        description="Find candidates by name, skills, or location"
      />

      <Card>
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search
              size={14}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Name or keyword..."
              className="input pl-9"
            />
          </div>
          <div className="relative">
            <Briefcase
              size={14}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Skills (comma-separated)"
              className="input pl-9"
            />
          </div>
          <div className="relative">
            <MapPin
              size={14}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Location..."
              className="input pl-9"
            />
          </div>
        </div>
        <Button className="w-full" leftIcon={<Search size={14} />} onClick={handleSearch}>
          Search Candidates
        </Button>

        {submitted && Object.values(activeFilters).some(Boolean) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(activeFilters)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <span
                  key={k}
                  className="bg-primary-light text-primary border-primary/20 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                >
                  {k}: {v}
                  <button onClick={() => clearFilter(k as keyof typeof activeFilters)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
          </div>
        )}
      </Card>

      {!submitted && (
        <EmptyState
          icon={<User size={36} />}
          title="Search for candidates"
          description="Use the filters above to find the right talent"
        />
      )}

      {submitted && isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {submitted && !isLoading && candidates.length === 0 && (
        <EmptyState
          icon={<User size={36} />}
          title="No candidates found"
          description="Try different keywords or broaden your search criteria"
        />
      )}

      {candidates.length > 0 && (
        <>
          <p className="text-muted-foreground text-sm">
            {meta?.total} candidate{meta?.total !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-3">
            {candidates.map((c) => (
              <Card key={c.id} hover>
                <div className="flex items-start gap-4">
                  <Avatar
                    src={c.avatarUrl}
                    name={`${c.firstName} ${c.lastName}`}
                    size="lg"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-foreground font-semibold">
                          {c.firstName} {c.lastName}
                        </h3>
                        {c.location && (
                          <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                            <MapPin size={11} />
                            {c.location}
                          </p>
                        )}
                      </div>
                      <Link href={`/search/candidates/${c.id}`}>
                        <Button size="sm">View Profile</Button>
                      </Link>
                    </div>

                    {c.bio && (
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{c.bio}</p>
                    )}

                    {c.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 6).map((s) => (
                          <Badge key={s} variant="neutral" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                        {c.skills.length > 6 && (
                          <Badge variant="neutral" className="text-[10px]">
                            +{c.skills.length - 6}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex gap-3">
                      {c.linkedinUrl && (
                        <a
                          href={c.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center gap-1 text-xs hover:underline"
                        >
                          <Linkedin size={11} />
                          LinkedIn
                        </a>
                      )}
                      {c.githubUrl && (
                        <a
                          href={c.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
                        >
                          <Github size={11} />
                          GitHub
                        </a>
                      )}
                      {c.portfolioUrl && (
                        <a
                          href={c.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-success flex items-center gap-1 text-xs hover:underline"
                        >
                          <Globe size={11} />
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ChevronLeft size={13} />}
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
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
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
