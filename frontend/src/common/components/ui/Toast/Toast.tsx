"use client";

import {
  Alert,
  type AlertProps,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import { AlertCircle, CheckCircle2, Info, Loader2, X } from "lucide-react";
import { forwardRef, useEffect, useState, type ReactNode } from "react";

type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastProps extends Omit<AlertProps, "severity" | "variant"> {
  severity?: ToastSeverity;
  message?: ReactNode;
  autoClose?: boolean;
  autoCloseDuration?: number;
  onClose?: () => void;
  action?: ReactNode;
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      severity = "info",
      message = "",
      autoClose = true,
      autoCloseDuration = 5000,
      onClose,
      action,
      children,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [isVisible, setIsVisible] = useState(true);

    const severityConfig: Record<
      ToastSeverity,
      { borderColor: string; glowColor: string; icon: ReactNode }
    > = {
      success: {
        borderColor: alpha(theme.palette.success.main, 0.4),
        glowColor: alpha(theme.palette.success.main, 0.2),
        icon: <CheckCircle2 size={20} color={theme.palette.success.main} />,
      },
      error: {
        borderColor: alpha(theme.palette.error.main, 0.4),
        glowColor: alpha(theme.palette.error.main, 0.2),
        icon: <AlertCircle size={20} color={theme.palette.error.main} />,
      },
      warning: {
        borderColor: alpha(theme.palette.warning.main, 0.4),
        glowColor: alpha(theme.palette.warning.main, 0.2),
        icon: <AlertCircle size={20} color={theme.palette.warning.main} />,
      },
      info: {
        borderColor: alpha(theme.palette.primary.main, 0.4),
        glowColor: alpha(theme.palette.primary.main, 0.2),
        icon: <Info size={20} color={theme.palette.primary.main} />,
      },
    };

    const config = severityConfig[severity];

    useEffect(() => {
      if (!autoClose || !isVisible) return;

      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }, [autoClose, autoCloseDuration, isVisible, onClose]);

    if (!isVisible) return null;

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    return (
      <Alert
        ref={ref}
        severity={severity}
        variant="outlined"
        icon={config.icon}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.88),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: config.borderColor,
          border: `1px solid ${config.borderColor}`,
          color: theme.palette.text.primary,
          boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${config.glowColor}`,
          borderRadius: "14px",
          fontFamily: '"Outfit", "Avenir Next", sans-serif',
          display: "flex",
          alignItems: "center",
          padding: "12px 18px",
          gap: 1.5,
          animation: "slideInUp 0.3s ease-out",
          "@keyframes slideInUp": {
            from: { transform: "translateY(20px)", opacity: 0 },
            to: { transform: "translateY(0)", opacity: 1 },
          },
          "& .MuiAlert-icon": { margin: 0, padding: 0 },
          "& .MuiAlert-message": {
            padding: 0,
            fontSize: "0.875rem",
            fontWeight: 600,
          },
        }}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {action}
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: theme.palette.text.secondary,
                padding: "2px",
                "&:hover": {
                  color: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              <X size={16} />
            </IconButton>
          </Box>
        }
        {...props}
      >
        {message || children}
      </Alert>
    );
  }
);

Toast.displayName = "Toast";

export default Toast;
export type { ToastProps, ToastSeverity };
