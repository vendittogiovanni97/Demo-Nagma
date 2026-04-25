'use client';

import { forwardRef, type ReactNode, type ReactElement } from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps, CircularProgress, useTheme } from '@mui/material';

type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'danger' | 'success' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingLabel,
      icon,
      fullWidth = false,
      disabled,
      children,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    // Get MUI size based on custom size prop
    const getMuiSize = (): 'small' | 'medium' | 'large' => {
      switch (size) {
        case 'sm':
          return 'small';
        case 'md':
          return 'medium';
        case 'lg':
          return 'large';
        default:
          return 'medium';
      }
    };

    // Get variant-specific sx styling
    const getVariantSx = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: theme.palette.primary.main,
            color: '#000',
            fontWeight: 600,
            boxShadow: '0 0 15px rgba(0, 191, 255, 0.3)',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: '0 0 20px rgba(0, 191, 255, 0.5)',
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          };
        case 'secondary':
          return {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderColor: theme.palette.primary.main,
            },
          };
        case 'glass':
          return {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: theme.palette.primary.main,
            },
          };
        case 'danger':
          return {
            backgroundColor: '#f44336',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)',
            '&:hover': {
              backgroundColor: '#d32f2f',
              boxShadow: '0 0 20px rgba(244, 67, 54, 0.5)',
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          };
        case 'success':
          return {
            backgroundColor: '#4caf50',
            color: '#000',
            fontWeight: 600,
            boxShadow: '0 0 15px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              backgroundColor: '#388e3c',
              boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)',
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(0, 191, 255, 0.05)',
              color: theme.palette.primary.main,
            },
          };
        case 'icon':
          return {
            minWidth: '44px',
            width: '44px',
            height: '44px',
            padding: 0,
            borderRadius: '8px',
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: theme.palette.text.primary,
            },
          };
        default:
          return {};
      }
    };

    return (
      <MuiButton
        ref={ref}
        disabled={disabled || isLoading}
        size={getMuiSize()}
        fullWidth={fullWidth}
        startIcon={isLoading ? <CircularProgress size={18} /> : icon as ReactNode}
        sx={{
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          ...getVariantSx(),
          ...sx,
        }}
        {...props}
      >
        {isLoading ? (loadingLabel || 'Caricamento...') : children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
