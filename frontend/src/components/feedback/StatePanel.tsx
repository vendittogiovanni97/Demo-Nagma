"use client";

import type { ReactNode } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

type StateVariant = 'loading' | 'empty' | 'error';

interface StatePanelProps {
  variant: StateVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const icons = {
  loading: Loader2,
  empty: Inbox,
  error: AlertCircle,
} as const;

export default function StatePanel({
  variant,
  title,
  description,
  action,
  className,
}: StatePanelProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-surface-border bg-white/2 px-6 py-10 text-center',
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-2xl border',
          variant === 'error' ? 'border-danger/20 bg-danger/10 text-danger' : 'border-surface-border bg-white/5 text-text-secondary'
        )}
      >
        <Icon size={22} className={variant === 'loading' ? 'animate-spin' : ''} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
