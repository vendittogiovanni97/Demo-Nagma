"use client";

import React, { useCallback, useRef, useState } from 'react';
import {
  Box, CircularProgress, useTheme, SxProps, Theme
} from '@mui/material';
import Button from '@/common/components/ui/Button';
import SmartModal from '@/common/components/common/SmartModal';
import { Cloud } from 'lucide-react';
import { useAttachments } from '@/common/hooks/domain/useAttachments';

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
    if (error) { alert(error); return; }

    const result = await uploadFile(file);
    if (result) {
      onUploadSuccess?.();
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [uploadFile, onUploadSuccess]);

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
      title="Carica allegati"
      maxWidth="sm"
      showFooter={false}
    >
      <Box sx={styles.content}>
        <Box
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={!uploading ? () => fileInputRef.current?.click() : undefined}
          sx={styles.dropzone(dragActive, uploading)}
        >
          <input
            ref={fileInputRef} type="file" onChange={handleInputChange}
            disabled={uploading} style={{ display: 'none' }} accept={ALLOWED_TYPES.join(',')}
          />

          {uploading ? (
            <Box sx={styles.uploadState}>
              <CircularProgress variant="determinate" value={uploadProgress} />
              <Box sx={styles.progressText}>{uploadProgress}%</Box>
            </Box>
          ) : (
            <Box sx={styles.idleState}>
              <Cloud size={48} strokeWidth={1.5} style={{ color: theme.palette.primary.main, opacity: 0.7 }} />
              <Box>
                <Box sx={styles.promptText}>Trascina file qui o clicca</Box>
                <Box sx={styles.limitText}>Max 10MB — Supportati: PDF, immagini, video, audio, documenti</Box>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={styles.infoBox}>
          L'upload avviene automaticamente. Una volta completato, il file sarà disponibile nella lista allegati.
        </Box>
      </Box>
    </SmartModal>
  );
}

const styles = {
  paper: {
    bgcolor: 'rgba(10, 26, 38, 0.95)', backdropFilter: 'blur(40px)',
    border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.58), 0px 0px 28px rgba(0, 191, 255, 0.07)',
  } as SxProps<Theme>,
  backdrop: {
    bgcolor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
  } as SxProps<Theme>,
  title: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', m: 0,
    fontSize: '1.125rem', fontWeight: 600, color: 'text.primary'
  } as SxProps<Theme>,
  closeButton: {
    ml: 1, color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
  } as SxProps<Theme>,
  content: {
    p: 3, display: 'flex', flexDirection: 'column', gap: 2.5
  } as SxProps<Theme>,
  dropzone: (isActive: boolean, isUploading: boolean) => ({
    border: '2px dashed',
    borderColor: isActive ? 'primary.main' : 'rgba(0, 191, 255, 0.3)',
    borderRadius: 2, p: 4, textAlign: 'center',
    cursor: isUploading ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    bgcolor: isActive ? 'rgba(0, 191, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
    opacity: isUploading ? 0.6 : 1,
    pointerEvents: isUploading ? 'none' : 'auto',
    '&:hover': !isUploading ? { borderColor: 'primary.main', bgcolor: 'rgba(0, 191, 255, 0.08)' } : {}
  } as SxProps<Theme>),
  uploadState: {
    display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center'
  } as SxProps<Theme>,
  progressText: {
    fontSize: '0.875rem', color: 'text.secondary'
  } as SxProps<Theme>,
  idleState: {
    display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center'
  } as SxProps<Theme>,
  promptText: {
    fontSize: '0.875rem', fontWeight: 600, color: 'text.primary'
  } as SxProps<Theme>,
  limitText: {
    fontSize: '0.75rem', color: 'text.secondary', mt: 0.5
  } as SxProps<Theme>,
  infoBox: {
    p: 1.5, bgcolor: 'rgba(0, 191, 255, 0.08)', borderRadius: 1.5,
    fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.6
  } as SxProps<Theme>,
};
