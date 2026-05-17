'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const AccordionSection = ({ title, children, defaultOpen = false }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-border mb-2 overflow-hidden rounded-xl border">
      <button
        onClick={() => setOpen(!open)}
        className="bg-surface hover:bg-muted flex w-full items-center justify-between px-4 py-3 text-left transition"
      >
        <span className="text-foreground text-sm font-medium">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>
      {open && <div className="border-border bg-surface border-t px-4 pt-2 pb-4">{children}</div>}
    </div>
  );
};
