"use client";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 bg-surface p-4 rounded-[25px] border border-surface-border shadow-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-outfit font-bold text-white">{title}</h1>
        <p className="text-text-secondary text-xs">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
