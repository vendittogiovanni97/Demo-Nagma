"use client";

import { createElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ComponentType, type ElementType, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'danger' | 'success' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode | ComponentType<{ size?: number; className?: string }>;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-black font-bold shadow-[0_0_15px_rgba(0,191,255,0.3)] hover:scale-105 hover:shadow-[0_0_20px_rgba(0,191,255,0.5)]',
  secondary: 'bg-[rgba(255,255,255,0.1)] border border-surface-border text-white hover:bg-[rgba(255,255,255,0.15)] hover:border-accent',
  glass: 'bg-[rgba(255,255,255,0.05)] border border-surface-border text-white backdrop-blur-md hover:bg-[rgba(255,255,255,0.1)] hover:border-accent',
  danger: 'bg-danger text-white font-bold shadow-[0_0_15px_rgba(255,82,82,0.3)] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,82,82,0.5)]',
  success: 'bg-success text-black font-bold shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:scale-105 hover:shadow-[0_0_20px_rgba(37,211,102,0.5)]',
  ghost: 'text-text-secondary hover:text-accent hover:bg-[rgba(0,191,255,0.05)]',
  icon: 'p-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/8 transition-all duration-150',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-[10px]',
  md: 'px-6 py-3 text-base rounded-[15px]',
  lg: 'px-8 py-4 text-lg rounded-[20px]',
};

const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingLabel,
      icon,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedIcon = isValidElement(icon)
      ? icon
      : (
        (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in icon))
          ? createElement(icon as ElementType, { size: 18 })
          : icon
      );

    const combinedClassName = twMerge(
      clsx(
        baseStyles,
        variantStyles[variant],
        variant !== 'icon' && sizeStyles[size],
        fullWidth && 'w-full',
        className
      )
    );

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>{loadingLabel || 'Caricamento...'}</span>
          </>
        ) : (
          <>
            {resolvedIcon && <span className="flex items-center justify-center shrink-0">{resolvedIcon}</span>}
            {children && <span>{children}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
