"use client";

import {
  Alert,
  type AlertProps,
  Box,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";
import { forwardRef, useEffect, useState, type ReactNode } from "react";

/**
 * Toast Component - MUI Alert con design system personalizzato e auto-dismiss
 *
 * Variants: success, error, warning, info
 * Severity levels
 * Close button
 * Auto-dismiss timer (5s default)
 *
 * @example
 * <Toast severity="success" message="Operazione completata!" />
 * <Toast severity="error" message="Errore di connessione" autoClose={false} />
 */

type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastProps extends Omit<AlertProps, "severity" | "variant"> {
  severity?: ToastSeverity;
  message?: ReactNode;
  autoClose?: boolean;
  autoCloseDuration?: number;
  onClose?: () => void;
  action?: ReactNode;
}

const severityConfig: Record<
  ToastSeverity,
  { backgroundColor: string; borderColor: string; color: string; icon: string }
> = {
  success: {
    backgroundColor: "rgba(37, 211, 102, 0.1)",
    borderColor: "rgba(37, 211, 102, 0.4)",
    color: "#25D366",
    icon: "✓",
  },
  error: {
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    borderColor: "rgba(255, 82, 82, 0.4)",
    color: "#ff5252",
    icon: "✕",
  },
  warning: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderColor: "rgba(255, 193, 7, 0.4)",
    color: "#FFC107",
    icon: "⚠",
  },
  info: {
    backgroundColor: "rgba(0, 191, 255, 0.1)",
    borderColor: "rgba(0, 191, 255, 0.4)",
    color: "#00BFFF",
    icon: "ℹ",
  },
};

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
    const [isVisible, setIsVisible] = useState(true);
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
        sx={{
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          border: `1px solid ${config.borderColor}`,
          color: "#ffffff",
          borderRadius: "12px",
          fontFamily: '"Outfit", sans-serif',
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          gap: 1,
          animation: "slideInUp 0.3s ease-out",
          "@keyframes slideInUp": {
            from: {
              transform: "translateY(20px)",
              opacity: 0,
            },
            to: {
              transform: "translateY(0)",
              opacity: 1,
            },
          },
          "& .MuiAlert-icon": {
            color: config.color,
            marginRight: "8px",
          },
          "& .MuiAlert-message": {
            padding: 0,
            fontSize: "0.95rem",
            fontWeight: 500,
          },
        }}
        icon={<Box sx={{ color: config.color }}>✓</Box>}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {action}
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: "inherit",
                padding: "2px",
                "&:hover": {
                  backgroundColor: `${config.color}20`,
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
