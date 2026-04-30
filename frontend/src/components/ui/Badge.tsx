'use client';

import { Chip, useTheme } from '@mui/material';
import { type ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'status-created' | 'status-confirmed' | 'status-completed' | 'status-cancelled' | 'status-pending' | 'status-rescheduled' | 'status-updated' | 'status-deleted';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  onDelete?: () => void;
  label?: string;
  removable?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  [key: string]: any;
}

const Badge = ({
  variant = 'primary',
  size = 'sm',
  onDelete,
  label,
  children,
  icon,
  removable,
  ...props
}: BadgeProps) => {
  const theme = useTheme();

  // Size mapping for MUI Chip
  const getSizeProps = () => {
    switch (size) {
      case 'xs':
        return {
          sx: { fontSize: '0.7rem', height: '20px' },
        };
      case 'sm':
        return {
          sx: { fontSize: '0.875rem', height: '24px' },
        };
      case 'md':
        return {
          sx: { fontSize: '1rem', height: '32px' },
        };
      default:
        return {};
    }
  };

  // Variant styling
  const getVariantSx = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 600,
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          color: '#f44336',
        };
      case 'success':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          color: '#4caf50',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(0, 191, 255, 0.2)',
          color: theme.palette.primary.main,
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 152, 0, 0.2)',
          color: '#ff9800',
        };
      case 'status-created':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        };
      case 'status-confirmed':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'status-completed':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'status-cancelled':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'status-pending':
        return {
          backgroundColor: 'rgba(217, 119, 6, 0.2)',
          color: '#d97706',
          border: '1px solid rgba(217, 119, 6, 0.3)',
        };
      case 'status-rescheduled':
        return {
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          color: '#8b5cf6',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        };
      case 'status-updated':
        return {
          backgroundColor: 'rgba(217, 119, 6, 0.2)',
          color: '#d97706',
          border: '1px solid rgba(217, 119, 6, 0.3)',
        };
      case 'status-deleted':
        return {
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          color: '#9ca3af',
          border: '1px solid rgba(156, 163, 175, 0.3)',
        };
      default:
        return {};
    }
  };

  return (
    <Chip
      label={label || children}
      onDelete={onDelete}
      icon={icon}
      {...props}
      sx={{
        borderRadius: '8px',
        fontWeight: 600,
        transition: 'all 0.15s ease-in-out',
        ...getSizeProps().sx,
        ...getVariantSx(),
        ...(props.sx || {}),
      }}
    />
  );
};

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
