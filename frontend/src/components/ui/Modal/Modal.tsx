"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type DialogProps,
  Box,
  IconButton,
} from "@mui/material";
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
              backgroundColor: "rgba(10, 26, 38, 0.95)",
              border: "1px solid rgba(0, 191, 255, 0.25)",
              borderRadius: "16px",
              fontFamily: '"Outfit", sans-serif',
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
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

export const ModalHeader = ({ title, onClose, subtitle }: ModalHeaderProps) => (
  <DialogTitle
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "24px",
      borderBottom: "1px solid rgba(0, 191, 255, 0.1)",
      color: "#ffffff",
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
            color: "#d1d1d1",
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
          color: "#d1d1d1",
          "&:hover": {
            color: "#00BFFF",
            backgroundColor: "rgba(0, 191, 255, 0.1)",
          },
        }}
        size="small"
      >
        <X size={20} />
      </IconButton>
    )}
  </DialogTitle>
);

/**
 * ModalBody Component - Body con contenuto
 */
interface ModalBodyProps {
  children: ReactNode;
}

export const ModalBody = ({ children }: ModalBodyProps) => (
  <DialogContent
    sx={{
      padding: "24px",
      color: "#d1d1d1",
      fontFamily: '"Outfit", sans-serif',
      fontSize: "0.95rem",
      lineHeight: 1.6,
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "rgba(0, 191, 255, 0.05)",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0, 191, 255, 0.3)",
        borderRadius: "4px",
        "&:hover": {
          backgroundColor: "rgba(0, 191, 255, 0.5)",
        },
      },
    }}
  >
    {children}
  </DialogContent>
);

/**
 * ModalFooter Component - Footer con action buttons
 */
interface ModalFooterProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
}

export const ModalFooter = ({ children, align = "end" }: ModalFooterProps) => (
  <DialogActions
    sx={{
      padding: "16px 24px",
      borderTop: "1px solid rgba(0, 191, 255, 0.1)",
      justifyContent: align === "start" ? "flex-start" : align === "center" ? "center" : "flex-end",
      gap: 1,
    }}
  >
    {children}
  </DialogActions>
);

export default Modal;
export type { ModalProps };
