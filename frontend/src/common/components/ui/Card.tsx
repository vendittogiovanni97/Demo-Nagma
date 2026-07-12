'use client';

import { Card as MuiCard, type CardProps as MuiCardProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { forwardRef, type ReactNode } from 'react';

type CardVariant = 'glass' | 'primary' | 'elevated' | 'minimal';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: CardVariant;
  size?: CardSize;
  interactive?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

// Map sizes to padding values (in MUI spacing units: 8px base)
const sizeMap: Record<CardSize, number> = {
  sm: 1.5, // 12px
  md: 3,   // 24px
  lg: 4,   // 32px
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      size = 'md',
      interactive = false,
      onClick,
      children,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const padding = sizeMap[size];

    // Build sx prop based on variant
    const getVariantSx = () => {
      switch (variant) {
        case 'glass':
          return {
            backgroundColor: alpha(theme.palette.common.white, 0.05),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`,
          };
        case 'primary':
          return {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
          };
        case 'elevated':
          return {
            backgroundColor: alpha(theme.palette.common.white, 0.1),
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          };
        case 'minimal':
          return {
            backgroundColor: 'transparent',
            border: 'none',
          };
        default:
          return {};
      }
    };

    return (
      <MuiCard
        ref={ref}
        onClick={interactive ? onClick : undefined}
        sx={[
          {
            p: padding,
            borderRadius: '12px',
            transition: 'all 0.2s ease-in-out',
            cursor: interactive ? 'pointer' : 'default',
            '&:hover': interactive
              ? {
                  transform: 'scale(1.02)',
                }
              : {},
            '&:active': interactive
              ? {
                  transform: 'scale(0.98)',
                }
              : {},
          },
          getVariantSx(),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </MuiCard>
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
