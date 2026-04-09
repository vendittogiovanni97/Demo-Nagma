import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const variantClasses = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full"
  };

  return (
    <div 
      className={cn(
        "animate-pulse bg-white/5 border border-white/5",
        variantClasses[variant],
        className
      )} 
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="w-full border border-white/10 rounded-[24px] overflow-hidden bg-white/[0.02]">
    <div className="p-6 border-b border-white/10 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-24" />
      ))}
    </div>
    <div className="p-6 space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={cn("h-4", j === 0 ? "w-32" : "w-20")} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const BentoSkeleton = () => (
  <div className="bg-white/[0.03] border border-white/10 rounded-[30px] p-8 flex flex-col gap-6 animate-pulse">
    <div className="flex justify-between items-start">
      <Skeleton className="h-8 w-32" />
      <Skeleton variant="circle" className="h-10 w-10" />
    </div>
    <div className="flex-1 flex flex-col gap-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="mt-auto">
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  </div>
);
