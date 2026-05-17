'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Divider: React.FC<{ className?: string; label?: string }> = ({ className, label }) =>
  label ? (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="bg-border h-px flex-1" />
    </div>
  ) : (
    <div className={cn('bg-border h-px', className)} />
  );
