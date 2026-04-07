"use client";

interface StatCardProps {
  value: string;
  label: string;
  color?: string;
  className?: string;
}

export default function StatCard({ value, label, color = 'text-white', className = '' }: StatCardProps) {
  return (
    <div className={`glass-panel p-6 text-center group ${className}`}>
      <div className={`text-3xl font-bold ${color} font-outfit group-hover:scale-110 transition-transform`}>
        {value}
      </div>
      <div className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
