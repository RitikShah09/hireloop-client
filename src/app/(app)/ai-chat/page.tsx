'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useMyJobs, useChatWithPool } from '@/hooks/useApi';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Card, CustomSelect, PageHeader, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function renderMessage(content: string) {
  const segments = content.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    const linkMatch = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <Link key={i} href={url} className="text-primary font-semibold hover:underline">
          {label}
        </Link>
      );
    }

    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {seg.slice(2, -2)}
        </strong>
      );
    }

    return seg.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

const SUGGESTIONS = [
  'Who is the strongest Node.js candidate?',
  'Show me candidates with React experience',
  'Which candidates are open to remote work?',
  'Rank all candidates by AI score',
  'Who has the most relevant experience?',
];

export default function AIChatPage() {
  useAuthGuard('COMPANY');
  const { data: jobsData } = useMyJobs();
  const jobs = jobsData?.data || [];
  const [selectedJobId, setSelectedJobId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutate: chat, isPending } = useChatWithPool();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (jobs.length && !selectedJobId) setSelectedJobId(jobs[0].id);
  }, [jobs]);

  const sendMessage = (msg?: string) => {
    const text = msg || input.trim();
    if (!text || !selectedJobId || isPending) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    chat(
      { jobId: selectedJobId, query: text },
      {
        onSuccess: (res) => {
          const answer = res.data.data?.answer || 'No response';
          setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try again.',
            },
          ]);
        },
      }
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-5xl flex-col">
      <PageHeader
        title="AI Recruiter Chat"
        description="Ask questions about your candidate pool — powered by RAG"
      />

      <div className="xs:max-w-xs mb-5 w-full">
        <CustomSelect
          label=""
          value={selectedJobId}
          placeholder="Select a job..."
          onChange={(value) => {
            setSelectedJobId(value);
            setMessages([]);
          }}
          options={jobs.map((j) => ({
            value: j.id,
            label: j.title,
          }))}
        />
      </div>

      <Card padding="none" className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && selectedJobId && (
            <div className="py-8 text-center">
              <div className="bg-primary-light mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
                <Bot size={24} className="text-primary" />
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                Ask me anything about your candidates
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="bg-primary-light text-primary hover:bg-primary-muted transition-micro border-primary/20 rounded-full border px-3 py-1.5 text-xs"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && !selectedJobId && (
            <div className="py-12 text-center">
              <Sparkles size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Select a job above to start chatting with your candidate pool
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="bg-primary-light mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Bot size={15} className="text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground border-border rounded-tl-sm border'
                )}
              >
                {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <User size={15} className="text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isPending && (
            <div className="flex gap-3">
              <div className="bg-primary-light flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Bot size={15} className="text-primary" />
              </div>
              <div className="bg-muted border-border rounded-lg rounded-tl-sm border px-4 py-3">
                <Spinner size={15} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-border border-t p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={selectedJobId ? 'Ask about your candidates...' : 'Select a job first'}
              disabled={!selectedJobId || isPending}
              className="input flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !selectedJobId || isPending}
              className="bg-primary text-primary-foreground hover:bg-primary-hover transition-micro rounded-lg p-2.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
