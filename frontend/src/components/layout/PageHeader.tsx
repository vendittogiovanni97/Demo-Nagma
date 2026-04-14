"use client";

import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, children, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-outfit font-bold text-white">{title}</h1>
      </div>

      {children}

      {actions ? (
        <div className="flex items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
