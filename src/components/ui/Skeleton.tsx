'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('skeleton', className)} />
);

export const SkeletonCard: React.FC = () => (
  <Card>
    <Skeleton className="mb-3 h-5 w-2/3" />
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="mb-4 h-4 w-4/5" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </Card>
);
