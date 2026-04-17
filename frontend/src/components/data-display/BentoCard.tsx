"use client";

import type { ReactNode } from 'react';

import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface BentoCardProps {
  title?: string;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function BentoCard({
  title,
  header,
  children,
  className,
  contentClassName,
}: BentoCardProps) {
  return (
    <Card variant="glass" size="md" className={cn('flex flex-col', className)}>
      {header ? (
        <div className="mb-4">{header}</div>
      ) : title ? (
        <h3 className="text-xl font-outfit mb-4">{title}</h3>
      ) : null}
      <div className={cn('flex-1', contentClassName)}>{children}</div>
    </Card>
  );
}
