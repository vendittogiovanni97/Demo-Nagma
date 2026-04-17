"use client";

import { forwardRef, type ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'status-confirmed' | 'status-completed' | 'status-cancelled' | 'status-pending' | 'status-rescheduled';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  children: ReactNode;
}

// Design token mapping: ogni variant ha background e text-color specifici
const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-accent text-black',
  secondary: 'bg-white/10 text-white',
  danger: 'bg-danger/20 text-danger',
  success: 'bg-success/20 text-success',
  info: 'bg-accent/20 text-accent',
  warning: 'bg-yellow/20 text-yellow',
  // Status-specific variants per booking/event status
  'status-confirmed': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'status-completed': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'status-cancelled': 'bg-red-500/20 text-red-400 border border-red-500/30',
  'status-pending': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'status-rescheduled': 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
};

// Sizing: padding e font-size controllati dal size prop
const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
};

const baseStyles = 'inline-flex items-center gap-1.5 rounded-lg font-semibold transition-opacity duration-150';

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'sm',
      icon: Icon,
      removable = false,
      onRemove,
      className,
      children,
    },
    ref
  ) => {
    if (removable && !onRemove) {
      console.warn('Badge: removable=true requires onRemove callback');
    }

    const combinedClassName = twMerge(
      clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )
    );

    const closeButtonSizeClass = clsx({
      'text-[0.7em]': true,
    });

    return (
      <div ref={ref} className={combinedClassName}>
        {Icon && <Icon className="flex-shrink-0" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />}
        <span>{children}</span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={clsx(
              'ml-1 flex items-center justify-center cursor-pointer',
              'hover:opacity-70 transition-opacity duration-150',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current',
              closeButtonSizeClass
            )}
            aria-label="Rimuovi"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

/**
 * Esempi di utilizzo:
 *
 * // 1. Badge semplice con variant
 * <Badge variant="primary">Nuovo</Badge>
 *
 * // 2. Badge con icona
 * import { CheckCircle } from 'lucide-react';
 * <Badge variant="success" icon={CheckCircle}>Completato</Badge>
 *
 * // 3. Badge rimovibile
 * const [visible, setVisible] = useState(true);
 * {visible && (
 *   <Badge
 *     variant="info"
 *     removable
 *     onRemove={() => setVisible(false)}
 *   >
 *     Info importante
 *   </Badge>
 * )}
 *
 * // 4. Badge con icona + rimovibile
 * <Badge
 *   variant="warning"
 *   size="md"
 *   icon={AlertCircle}
 *   removable
 *   onRemove={() => handleRemove()}
 *   className="custom-style"
 * >
 *   Attenzione
 * </Badge>
 *
 * // 5. Badge con diversi size
 * <div className="flex gap-2">
 *   <Badge size="xs">Extra Small</Badge>
 *   <Badge size="sm" variant="secondary">Small</Badge>
 *   <Badge size="md" variant="danger">Medium</Badge>
 * </div>
 */
