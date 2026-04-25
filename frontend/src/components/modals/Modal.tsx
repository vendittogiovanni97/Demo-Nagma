"use client";

import { Box, Dialog, DialogContent, DialogTitle, IconButton, useTheme } from '@mui/material';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}: ModalProps) {
  const theme = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'rgba(10, 26, 38, 0.95)',
            backdropFilter: 'blur(40px)',
            border: `1px solid rgba(255, 255, 255, 0.08)`,
            borderRadius: '12px',
            boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.58), 0px 0px 28px rgba(0, 191, 255, 0.07)'
          }
        },
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)'
          }
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: theme.palette.text.primary,
          letterSpacing: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '18px 20px',
          borderBottom: `1px solid rgba(255, 255, 255, 0.06)`,
          m: 0
        }}
      >
        <Box sx={{ flex: 1 }}>{title}</Box>
        <IconButton
          onClick={onClose}
          sx={{
            ml: 1,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          size="small"
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: '18px 20px',
          maxHeight: 'calc(100vh - 96px)',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 191, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 191, 255, 0.5)'
            }
          }
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
