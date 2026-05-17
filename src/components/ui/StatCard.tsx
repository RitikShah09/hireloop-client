'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  icon,
  trend,
  color = 'text-primary bg-primary-light',
}) => (
  <Card>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="text-foreground text-2xl font-semibold">{value}</p>
        {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
        {trend && (
          <p className={cn('mt-1 text-xs', trend.value >= 0 ? 'text-success' : 'text-danger')}>
            {trend.value >= 0 ? '+' : ''}
            {trend.value}% {trend.label}
          </p>
        )}
      </div>
      {icon && <div className={cn('rounded-lg p-2.5', color)}>{icon}</div>}
    </div>
  </Card>
);
