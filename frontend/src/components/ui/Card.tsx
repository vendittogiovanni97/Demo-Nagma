"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

type CardVariant = 'glass' | 'primary' | 'elevated' | 'minimal';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

// Variant styles basati sui design token
// glass: semi-transparent con border accent
// primary: sfondo accent leggero con border accent
// elevated: sfondo più opaco con border sottile bianco
// minimal: trasparente senza border
const variantStyles: Record<CardVariant, string> = {
  glass: 'bg-[rgba(255,255,255,0.05)] border border-surface-border backdrop-blur-md',
  primary: 'bg-[rgba(0,191,255,0.1)] border border-accent/40',
  elevated: 'bg-[rgba(255,255,255,0.1)] border border-white/20',
  minimal: 'bg-transparent border-0',
};

// Padding basato su size - applica tailwind padding utilities
const sizeStyles: Record<CardSize, string> = {
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

const baseStyles = 'rounded-xl transition-all duration-200';

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      size = 'md',
      interactive = false,
      className,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const interactiveStyles = interactive
      ? 'cursor-pointer hover:scale-105 active:scale-100'
      : '';

    const combinedClassName = twMerge(
      clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        interactiveStyles,
        className
      )
    );

    return (
      <div
        ref={ref}
        className={combinedClassName}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive && onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

/**
 * ESEMPI DI UTILIZZO:
 *
 * 1. Card glass standard (default):
 *    <Card>
 *      <h3 className="text-lg font-bold">Titolo</h3>
 *      <p className="text-text-secondary">Contenuto della card</p>
 *    </Card>
 *
 * 2. Card primary interattiva:
 *    <Card variant="primary" interactive onClick={() => console.log('clicked')}>
 *      <div>Clicca su questa card interattiva</div>
 *    </Card>
 *
 * 3. Card elevated con padding grande:
 *    <Card variant="elevated" size="lg">
 *      <div className="space-y-4">
 *        <h2>Contenuto dettagliato</h2>
 *        <p>Con spazio generoso</p>
 *      </div>
 *    </Card>
 *
 * 4. Card minimal compatta con classe personalizzata:
 *    <Card variant="minimal" size="sm" className="border-b border-surface-border">
 *      <p>Card minimal con border inferiore personalizzato</p>
 *    </Card>
 */
