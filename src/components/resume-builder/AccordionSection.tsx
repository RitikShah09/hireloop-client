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
    <div className="mb-2 overflow-hidden rounded-xl border border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-white px-4 py-3 text-left transition hover:bg-gray-50"
      >
        <span className="text-sm font-medium text-gray-800">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {open && <div className="border-t border-gray-100 bg-white px-4 pt-2 pb-4">{children}</div>}
    </div>
  );
};
