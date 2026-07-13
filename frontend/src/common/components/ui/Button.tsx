'use client';

import { forwardRef, type ReactNode, createElement, isValidElement } from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps, CircularProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'danger' | 'success' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode | React.ElementType;
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
            color: theme.palette.common.black,
            fontWeight: 600,
            boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          };
        case 'secondary':
          return {
            backgroundColor: alpha(theme.palette.common.white, 0.1),
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              borderColor: theme.palette.primary.main,
            },
          };
        case 'glass':
          return {
            backgroundColor: alpha(theme.palette.common.white, 0.05),
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              borderColor: theme.palette.primary.main,
            },
          };
        case 'danger':
          return {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.common.white,
            fontWeight: 600,
            boxShadow: `0 0 15px ${alpha(theme.palette.error.main, 0.3)}`,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
              boxShadow: `0 0 20px ${alpha(theme.palette.error.main, 0.5)}`,
              transform: 'scale(1.02)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          };
        case 'success':
          return {
            backgroundColor: theme.palette.success.main,
            color: theme.palette.common.black,
            fontWeight: 600,
            boxShadow: `0 0 15px ${alpha(theme.palette.success.main, 0.3)}`,
            '&:hover': {
              backgroundColor: theme.palette.success.dark,
              boxShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.5)}`,
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
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              color: theme.palette.primary.main,
            },
          };
        case 'icon':
          return {
            minWidth: '44px',
            width: '44px',
            height: '44px',
            padding: 0,
            borderRadius: '50%',
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .MuiButton-startIcon': {
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.08),
              color: theme.palette.text.primary,
            },
          };
        default:
          return {};
      }
    };

    // Render icon if it's a component function
    const renderIcon = () => {
      if (isLoading) return <CircularProgress size={18} />;
      if (!icon) return undefined;

      // Se è già un elemento JSX valido, usalo direttamente
      if (isValidElement(icon)) {
        return icon;
      }

      // Se è un componente (funzione, forward ref, memo, ecc.), renderizzalo
      if (icon && typeof icon !== 'string') {
        return createElement(icon as React.ComponentType<{ size?: number }>, { size: 18 });
      }

      return icon as ReactNode;
    };

    return (
      <MuiButton
        ref={ref}
        disabled={disabled || isLoading}
        size={getMuiSize()}
        fullWidth={fullWidth}
        startIcon={renderIcon()}
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

// ─── Semantic Wrappers ────────────────────────────────────────────────────────
// Pattern da platform-starter: default opinionati, tutto override-able via props.

/**
 * OkButton — conferma/salva azione primaria.
 * Default: variant="primary", label="Conferma"
 */
export const OkButton = ({
  children = 'Conferma',
  variant = 'primary',
  ...props
}: ButtonProps) => (
  <Button variant={variant} {...props}>
    {children}
  </Button>
);
OkButton.displayName = 'OkButton';

/**
 * CancelButton — annulla/torna indietro senza azione distruttiva.
 * Default: variant="ghost", label="Annulla"
 */
export const CancelButton = ({
  children = 'Annulla',
  variant = 'ghost',
  ...props
}: ButtonProps) => (
  <Button variant={variant} {...props}>
    {children}
  </Button>
);
CancelButton.displayName = 'CancelButton';

/**
 * CloseButton — chiude modal/panel senza alcuna azione.
 * Default: variant="ghost", label="Chiudi"
 */
export const CloseButton = ({
  children = 'Chiudi',
  variant = 'ghost',
  ...props
}: ButtonProps) => (
  <Button variant={variant} {...props}>
    {children}
  </Button>
);
CloseButton.displayName = 'CloseButton';

/**
 * DeleteButton — azione distruttiva (elimina, cancella).
 * Default: variant="danger", label="Elimina"
 */
export const DeleteButton = ({
  children = 'Elimina',
  variant = 'danger',
  ...props
}: ButtonProps) => (
  <Button variant={variant} {...props}>
    {children}
  </Button>
);
DeleteButton.displayName = 'DeleteButton';

/**
 * SaveButton — salva form/modifiche.
 * Default: variant="primary", label="Salva"
 */
export const SaveButton = ({
  children = 'Salva',
  variant = 'primary',
  ...props
}: ButtonProps) => (
  <Button variant={variant} {...props}>
    {children}
  </Button>
);
SaveButton.displayName = 'SaveButton';

export default Button;
