"use client";

import React, { useCallback, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Button from '@/common/components/ui/Button';
import SmartModal from '@/common/components/common/SmartModal';
import { CloudUpload, FileText, Upload } from 'lucide-react';
import { useAttachments } from '@/common/hooks/domain/useAttachments';
import { useToast } from '@/common/hooks/useToast';

interface AttachmentUploadModalProps {
  bookingId: string;
  open: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/webm', 'text/plain',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function AttachmentUploadModal({
  bookingId, open, onClose, onUploadSuccess,
}: AttachmentUploadModalProps) {
  const toast = useToast();
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

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }

    const result = await uploadFile(file);
    if (result) {
      onUploadSuccess?.();
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [uploadFile, onUploadSuccess, toast]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  return (
    <SmartModal
      isOpen={open}
      onClose={onClose}
      title="Carica allegato prenotazione"
      maxWidth="sm"
      showFooter={false}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!uploading ? () => fileInputRef.current?.click() : undefined}
          sx={{
            position: 'relative',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            border: `2px dashed ${dragActive ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3)}`,
            bgcolor: dragActive
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.background.paper, 0.4),
            boxShadow: dragActive
              ? `0 0 30px ${alpha(theme.palette.primary.main, 0.3)}`
              : 'none',
            transition: 'all 0.25s ease',
            '&:hover': !uploading ? {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transform: 'scale(1.01)',
            } : {},
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', py: 2 }}>
              <CircularProgress
                variant="determinate"
                value={uploadProgress}
                size={54}
                thickness={4}
                sx={{ color: theme.palette.primary.main }}
              />
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                Caricamento in corso... {uploadProgress}%
              </Typography>
              <Box sx={{ width: '80%', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    '& .MuiLinearProgress-bar': { borderRadius: 3 },
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', py: 1 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              >
                <CloudUpload size={32} style={{ color: theme.palette.primary.main }} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  Trascina il file qui o clicca per sfogliare
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Supportati: PDF, Immagini, Video, Audio, Documenti (Max 10MB)
                </Typography>
              </Box>

              <Button
                variant="secondary"
                size="sm"
                icon={<Upload size={14} />}
                sx={{ mt: 1, pointerEvents: 'none' }}
              >
                Seleziona File dal PC
              </Button>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <FileText size={18} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.5 }}>
            L'upload viene associato direttamente alla scheda prenotazione. I file saranno scaricabili e consultabili in qualsiasi momento.
          </Typography>
        </Box>
      </Box>
    </SmartModal>
  );
}
