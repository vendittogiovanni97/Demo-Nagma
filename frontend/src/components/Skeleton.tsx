import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "animate-pulse bg-[rgba(255,255,255,0.05)] border border-surface-border";
  const variantClasses = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded h-4 w-full"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const BentoSkeleton = () => (
  <div className="glass-panel p-6 flex flex-col gap-4 animate-pulse">
    <Skeleton variant="text" className="w-1/3 h-6" />
    <div className="flex-1 flex items-center justify-center">
      <Skeleton variant="circle" className="w-32 h-32" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  </div>
);
