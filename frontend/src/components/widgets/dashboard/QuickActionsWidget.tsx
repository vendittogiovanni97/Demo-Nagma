"use client";

import { Package, Users } from 'lucide-react';

import BentoCard from '@/components/data-display/BentoCard';

interface QuickActionsWidgetProps {
  onCustomersClick: () => void;
  onCreamsClick: () => void;
  className?: string;
}

export default function QuickActionsWidget({
  onCustomersClick,
  onCreamsClick,
  className,
}: QuickActionsWidgetProps) {
  return (
    <BentoCard className={className} contentClassName="flex flex-col justify-center gap-3">
      <button
        onClick={onCustomersClick}
        className="glass-btn flex items-center justify-center gap-3 py-4"
      >
        <Users size={16} />
        <span>Clienti</span>
      </button>
      <button
        onClick={onCreamsClick}
        className="btn-primary flex items-center justify-center gap-3 py-4"
      >
        <Package size={16} />
        <span>Creme</span>
      </button>
    </BentoCard>
  );
}
