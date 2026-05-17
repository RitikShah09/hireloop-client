'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
}) => (
  <div
    className={cn(
      'mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center',
      className
    )}
  >
    <div>
      <h1 className="text-foreground text-xl font-semibold">{title}</h1>
      {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
