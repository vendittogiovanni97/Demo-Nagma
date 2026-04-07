"use client";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center bg-surface p-6 rounded-[25px] border border-surface-border shadow-xl">
      <div>
        <h1 className="text-3xl font-outfit font-bold text-white">{title}</h1>
        <p className="text-text-secondary text-sm">{subtitle}</p>
      </div>
      {actions && <div className="flex gap-4">{actions}</div>}
    </div>
  );
}
