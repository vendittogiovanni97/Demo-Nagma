"use client";

import type { ElementType, ReactNode } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

type StateVariant = 'loading' | 'empty' | 'error';

interface StatePanelProps {
  variant: StateVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ElementType;
  fullPage?: boolean;
  className?: string;
}

const defaultIcons = {
  loading: Loader2,
  empty: Inbox,
  error: AlertCircle,
} as const;

const variantStyles = {
  error: { ring: 'border-danger/20 bg-danger/10 text-danger', ringFull: 'bg-danger/10 text-danger' },
  empty: { ring: 'border-surface-border bg-white/5 text-text-secondary', ringFull: 'bg-accent/10 text-accent' },
  loading: { ring: 'border-surface-border bg-white/5 text-text-secondary', ringFull: 'bg-accent/10 text-accent' },
} as const;

export default function StatePanel({
  variant,
  title,
  description,
  action,
  icon,
  fullPage = false,
  className,
}: StatePanelProps) {
  const Icon = icon ?? defaultIcons[variant];
  const styles = variantStyles[variant];

  if (fullPage) {
    return (
      <div className={cn('flex-1 flex items-center justify-center p-6', className)}>
        <div className="text-center max-w-md">
          <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', styles.ringFull)}>
            <Icon size={28} className={variant === 'loading' ? 'animate-spin' : ''} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    );
  }

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
          styles.ring
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
