'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
    {icon && <div className="text-muted-foreground mb-4 opacity-40">{icon}</div>}
    <h3 className="text-foreground mb-1 text-base font-semibold">{title}</h3>
    {description && <p className="text-muted-foreground mb-4 max-w-xs text-sm">{description}</p>}
    {action}
  </div>
);
