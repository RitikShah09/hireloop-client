'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/axios';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  MapPin,
  Wifi,
  Briefcase,
  Brain,
  ArrowRight,
  IndianRupee,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Card, Badge, Button, PageHeader, EmptyState, Spinner } from '@/components/ui';

interface AIMatch {
  id: string;
  relevanceScore: number;
  reason: string;
  job?: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    location?: string | null;
    isRemote: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    createdAt: string;
    company?: {
      name: string;
      logoUrl?: string | null;
      location?: string | null;
    };
  };
}

interface AISearchResponse {
  matches: AIMatch[];
  suggestion?: string;
}

const SUGGESTIONS = [
  'Full stack developer with Node.js and React experience',
  'Remote backend engineer with PostgreSQL',
  'React developer in Pune with 2 years experience',
  'DevOps engineer who knows Docker and Kubernetes',
  'Python developer for data processing pipelines',
];

function scoreVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}

export default function AIJobSearchPage() {
  useAuthGuard('CANDIDATE');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AIMatch[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { mutate: search, isPending } = useMutation({
    mutationFn: async (q: string) => {
      const res = await api.post('/jobs/ai-search', { query: q });
      return res.data.data as AISearchResponse;
    },
    onSuccess: ({ matches, suggestion: s }) => {
      setResults(matches.filter((m) => m.job));
      setSuggestion(s ?? null);
      setHasSearched(true);
    },
    onError: () => toast.error('AI search failed. Please try again.'),
  });

  const handleSearch = (q?: string) => {
    const text = (q || query).trim();
    if (!text) return;
    search(text);
    if (q) setQuery(q);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="AI Job Search"
        description="Describe what you're looking for in plain English — AI finds the best matches"
      />

      <Card>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="text-muted-foreground absolute top-1/2 left-3.5 -translate-y-1/2"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Full stack developer with Node.js, open to remote, 3 years experience..."
              className="input pl-10"
            />
          </div>
          <Button
            leftIcon={isPending ? <Spinner size={14} /> : <Sparkles size={14} />}
            isLoading={isPending}
            disabled={!query.trim()}
            onClick={() => handleSearch()}
            className="h-10.25"
          >
            AI Search
          </Button>
        </div>

        {!hasSearched && (
          <div className="mt-4">
            <p className="text-muted-foreground mb-2 text-xs">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="bg-primary-light text-primary hover:bg-primary-muted transition-micro border-primary/20 rounded-full border px-3 py-1.5 text-xs"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {isPending && (
        <div className="flex items-center justify-center py-12">
          <div className="bg-primary-light border-primary/20 flex items-center gap-3 rounded-lg border px-6 py-4">
            <Spinner size={16} />
            <div>
              <p className="text-primary text-sm font-medium">AI is analysing active jobs...</p>
              <p className="text-primary/70 mt-0.5 text-xs">
                Finding the best matches for your query
              </p>
            </div>
          </div>
        </div>
      )}

      {!isPending && hasSearched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-title">
              {results.length > 0 ? `${results.length} AI-matched jobs` : 'No matches found'}
            </p>
            {results.length > 0 && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Brain size={11} />
                Ranked by AI relevance
              </span>
            )}
          </div>

          {suggestion && (
            <div className="bg-primary-light border-primary/20 flex items-start gap-2 rounded-lg border px-4 py-3">
              <Sparkles size={13} className="text-primary mt-0.5 shrink-0" />
              <p className="text-primary text-xs">{suggestion}</p>
            </div>
          )}

          {results.length === 0 ? (
            <EmptyState
              icon={<Search size={36} />}
              title="No matching jobs found"
              description="Try different keywords or broaden your search"
            />
          ) : (
            results.map((r, idx) => {
              const job = r.job!;
              return (
                <Card key={r.id} hover>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-foreground font-semibold">{job.title}</h3>
                          <p className="text-muted-foreground mt-0.5 text-sm">
                            {job.company?.name}
                          </p>
                        </div>
                        <Badge variant={scoreVariant(r.relevanceScore)} className="shrink-0">
                          {r.relevanceScore}% match
                        </Badge>
                      </div>

                      <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-xs">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {job.location}
                          </span>
                        )}
                        {job.isRemote && (
                          <span className="text-success flex items-center gap-1">
                            <Wifi size={10} />
                            Remote
                          </span>
                        )}
                        {job.salaryMin && (
                          <span className="flex items-center gap-1">
                            <IndianRupee size={10} />
                            {(job.salaryMin / 100000).toFixed(1)}–
                            {((job.salaryMax || job.salaryMin) / 100000).toFixed(1)}L
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Briefcase size={10} />
                          {formatDistanceToNow(new Date(job.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 5).map((s) => (
                          <Badge key={s} variant="primary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div className="bg-primary-light mt-3 flex items-start gap-2 rounded-lg p-2.5">
                        <Brain size={12} className="text-primary mt-0.5 shrink-0" />
                        <p className="text-primary text-xs">{r.reason}</p>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link href={`/jobs/${job.id}`}>
                          <Button size="sm" rightIcon={<ArrowRight size={13} />}>
                            View &amp; Apply
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {!isPending && !hasSearched && (
        <Card className="py-10 text-center">
          <div className="bg-primary-light mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg">
            <Brain size={28} className="text-primary" />
          </div>
          <h3 className="text-foreground mb-2 font-semibold">Describe your ideal job</h3>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm">
            Use natural language — mention your skills, experience level, location preference, or
            anything that matters to you.
          </p>
        </Card>
      )}
    </div>
  );
}
