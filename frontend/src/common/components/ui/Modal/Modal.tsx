"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type DialogProps,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import { X } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

/**
 * Modal/Dialog Component - MUI Dialog con design system personalizzato
 *
 * Header con title + close button
 * Body con content
 * Footer con action buttons
 * Backdrop click to close
 *
 * @example
 * <Modal open={isOpen} onClose={handleClose}>
 *   <ModalHeader title="Titolo" onClose={handleClose} />
 *   <ModalBody>Contenuto qui</ModalBody>
 *   <ModalFooter>
 *     <Button onClick={handleClose}>Annulla</Button>
 *     <Button variant="primary">Conferma</Button>
 *   </ModalFooter>
 * </Modal>
 */

interface ModalProps extends Omit<DialogProps, "children"> {
  open: boolean;
  onClose: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      maxWidth = "sm",
      children,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: alpha(theme.palette.background.default, 0.95),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              borderRadius: "16px",
              fontFamily: '"Outfit", sans-serif',
              boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.4)}`,
            },
          },
          backdrop: {
            sx: {
              backgroundColor: alpha(theme.palette.common.black, 0.4),
              backdropFilter: "blur(4px)",
            },
          },
        }}
        {...props}
      >
        {children}
      </Dialog>
    );
  }
);

Modal.displayName = "Modal";

/**
 * ModalHeader Component - Header con title e close button
 */
interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  subtitle?: string;
}

export const ModalHeader = ({ title, onClose, subtitle }: ModalHeaderProps) => {
  const theme = useTheme();
  return (
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px",
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        color: theme.palette.common.white,
        fontWeight: 700,
        fontSize: "1.25rem",
        fontFamily: '"Outfit", sans-serif',
      }}
    >
      <Box>
        {title}
        {subtitle && (
          <Box
            sx={{
              fontSize: "0.875rem",
              color: theme.palette.text.secondary,
              fontWeight: 400,
              marginTop: "4px",
            }}
          >
            {subtitle}
          </Box>
        )}
      </Box>
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
          size="small"
        >
          <X size={20} />
        </IconButton>
      )}
    </DialogTitle>
  );
};

/**
 * ModalBody Component - Body con contenuto
 */
interface ModalBodyProps {
  children: ReactNode;
}

export const ModalBody = ({ children }: ModalBodyProps) => {
  const theme = useTheme();
  return (
    <DialogContent
      sx={{
        padding: "24px",
        color: theme.palette.text.secondary,
        fontFamily: '"Outfit", sans-serif',
        fontSize: "0.95rem",
        lineHeight: 1.6,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(theme.palette.primary.main, 0.3),
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.5),
          },
        },
      }}
    >
      {children}
    </DialogContent>
  );
};

/**
 * ModalFooter Component - Footer con action buttons
 */
interface ModalFooterProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
}

export const ModalFooter = ({ children, align = "end" }: ModalFooterProps) => {
  const theme = useTheme();
  return (
    <DialogActions
      sx={{
        padding: "16px 24px",
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        justifyContent: align === "start" ? "flex-start" : align === "center" ? "center" : "flex-end",
        gap: 1,
      }}
    >
      {children}
    </DialogActions>
  );
};

export default Modal;
export type { ModalProps };
