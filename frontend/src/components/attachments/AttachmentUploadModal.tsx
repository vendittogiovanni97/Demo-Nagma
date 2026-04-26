"use client";

import { useAttachments } from '@/hooks/domain/useAttachments';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, useTheme } from '@mui/material';
import { Cloud, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface AttachmentUploadModalProps {
  bookingId: string;
  open: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/webm',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function AttachmentUploadModal({
  bookingId,
  open,
  onClose,
  onUploadSuccess,
}: AttachmentUploadModalProps) {
  const theme = useTheme();
  const { uploadFile, uploading, uploadProgress } = useAttachments({ bookingId });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File troppo grande (max 10MB, ricevuto ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo di file non supportato: ${file.type || 'sconosciuto'}`;
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      const result = await uploadFile(file);
      if (result) {
        onUploadSuccess?.();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [uploadFile, onUploadSuccess]
  );

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'rgba(10, 26, 38, 0.95)',
            backdropFilter: 'blur(40px)',
            border: `1px solid rgba(255, 255, 255, 0.08)`,
            borderRadius: '12px',
            boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.58), 0px 0px 28px rgba(0, 191, 255, 0.07)',
          },
        },
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '18px 20px',
          borderBottom: `1px solid rgba(255, 255, 255, 0.06)`,
          m: 0,
        }}
      >
        <Box sx={{ flex: 1 }}>Carica allegati</Box>
        <IconButton
          onClick={onClose}
          disabled={uploading}
          sx={{
            ml: 1,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          size="small"
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Dropzone Area */}
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!uploading ? handleClick : undefined}
          sx={{
            border: `2px dashed ${
              dragActive
                ? theme.palette.primary.main
                : 'rgba(0, 191, 255, 0.3)'
            }`,
            borderRadius: '8px',
            p: 3,
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: dragActive
              ? 'rgba(0, 191, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.02)',
            '&:hover': !uploading
              ? {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(0, 191, 255, 0.08)',
                }
              : undefined,
            opacity: uploading ? 0.6 : 1,
            pointerEvents: uploading ? 'none' : 'auto',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            disabled={uploading}
            style={{ display: 'none' }}
            accept={ALLOWED_TYPES.join(',')}
          />

          {uploading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <CircularProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  color: theme.palette.primary.main,
                }}
              />
              <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                {uploadProgress}%
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
              <Cloud
                size={48}
                strokeWidth={1.5}
                style={{ color: theme.palette.primary.main, opacity: 0.7 }}
              />
              <Box>
                <Box
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  Trascina file qui o clicca
                </Box>
                <Box
                  sx={{
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary,
                    mt: 0.5,
                  }}
                >
                  Max 10MB — Supportati: PDF, immagini, video, audio, documenti
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Info */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: 'rgba(0, 191, 255, 0.08)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: theme.palette.text.secondary,
            lineHeight: 1.6,
          }}
        >
          L'upload avviene automaticamente. Una volta completato, il file sarà disponibile nella lista allegati della prenotazione.
        </Box>
      </DialogContent>
    </Dialog>
  );
}
