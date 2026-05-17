'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Spinner: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className,
}) => <Loader2 size={size} className={cn('text-primary animate-spin', className)} />;
