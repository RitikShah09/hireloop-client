'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

export const Card: React.FC<CardProps> = ({
  className,
  hover,
  padding = 'md',
  children,
  ...props
}) => (
  <div className={cn(hover ? 'card-hover' : 'card', paddingClasses[padding], className)} {...props}>
    {children}
  </div>
);
