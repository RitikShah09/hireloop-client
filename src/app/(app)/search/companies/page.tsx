'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/axios';
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
} from 'lucide-react';
import {
  Card,
  Button,
  Avatar,
  PageHeader,
  EmptyState,
  Skeleton,
  CustomSelect,
} from '@/components/ui';
import { cn } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  _count: { jobs: number };
}

interface ApiResponse {
  data: Company[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const INDUSTRIES = [
  'Software',
  'Fintech',
  'Healthtech',
  'Edtech',
  'E-commerce',
  'SaaS',
  'Gaming',
  'AI/ML',
  'Cybersecurity',
];

export default function CompanySearchPage() {
  useAuthGuard('CANDIDATE');

  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    industry: '',
    location: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search-companies', activeFilters, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '9' });
      if (activeFilters.search) params.set('search', activeFilters.search);
      if (activeFilters.industry) params.set('industry', activeFilters.industry);
      if (activeFilters.location) params.set('location', activeFilters.location);
      const res = await api.get(`/search/companies?${params}`);
      return res.data as ApiResponse;
    },
    enabled: submitted,
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['search-companies-all', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '9' });
      const res = await api.get(`/search/companies?${params}`);
      return res.data as ApiResponse;
    },
    enabled: !submitted,
  });

  const displayData = submitted ? data : allData;
  const displayLoading = submitted ? isLoading : allLoading;
  const companies = displayData?.data || [];
  const meta = displayData?.meta;

  const handleSearch = () => {
    setActiveFilters({ search, industry, location });
    setPage(1);
    setSubmitted(true);
  };

  const clearFilter = (key: keyof typeof activeFilters) => {
    const updated = { ...activeFilters, [key]: '' };
    setActiveFilters(updated);
    if (key === 'search') setSearch('');
    if (key === 'industry') setIndustry('');
    if (key === 'location') setLocation('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Explore Companies"
        description="Find companies hiring and learn about their culture"
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
              placeholder="Company name..."
              className="input pl-9"
            />
          </div>
          <CustomSelect
            value={industry}
            placeholder="All Industries"
            onChange={(value) => setIndustry(value)}
            options={INDUSTRIES.map((i) => ({
              value: i,
              label: i,
            }))}
          />
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
          Search Companies
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

      {displayLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="mb-3 flex items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="mb-1 h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 size={36} />}
          title="No companies found"
          description="Try a different search term or industry filter"
        />
      ) : (
        <>
          {meta && (
            <p className="text-muted-foreground text-sm">
              {meta.total} compan{meta.total !== 1 ? 'ies' : 'y'} found
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <Link key={c.id} href={`/search/companies/${c.id}`} className="group block">
                <Card hover className="h-full">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar
                      src={c.logoUrl}
                      name={c.name}
                      size="lg"
                      className="shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground group-hover:text-primary transition-micro truncate font-semibold">
                        {c.name}
                      </h3>
                      {c.industry && <p className="text-primary text-xs">{c.industry}</p>}
                    </div>
                  </div>

                  {c.description && (
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                      {c.description}
                    </p>
                  )}

                  <div className="space-y-1.5">
                    {c.location && (
                      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <MapPin size={10} />
                        {c.location}
                      </p>
                    )}
                    {c.size && (
                      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Users size={10} />
                        {c.size} employees
                      </p>
                    )}
                    <p className="text-success flex items-center gap-1.5 text-xs font-medium">
                      <Briefcase size={10} />
                      {c._count.jobs} active job{c._count.jobs !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Card>
              </Link>
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
