"use client";

import React, { useEffect, useState } from 'react';
import {
  Box, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, useTheme, SxProps, Theme
} from '@mui/material';
import axios from 'axios';
import { X, FileText, Music, AlertCircle } from 'lucide-react';
import { getToken } from '@/utils/auth';
import { useToast } from '@/hooks/useToast';
import type { Attachment } from '@/types/attachment';

interface AttachmentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  attachment: Attachment;
}

function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('text')) return 'text';
  if (mimeType.includes('word') || mimeType.includes('document') || 
      mimeType.includes('presentation') || mimeType.includes('sheet') || mimeType.includes('excel')) {
    return 'document';
  }
  return 'other';
}

export default function AttachmentPreviewModal({ open, onClose, attachment }: AttachmentPreviewModalProps) {
  const theme = useTheme();
  const toast = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const category = getFileCategory(attachment.mimeType);
  const isRenderable = ['image', 'pdf', 'video', 'audio', 'text'].includes(category);

  useEffect(() => {
    if (!open) { setPreviewUrl(null); return; }
    setPreviewError(false);
    if (!isRenderable) { setIsLoading(false); return; }

    setIsLoading(true);
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const token = getToken();
        const response = await axios.get(`${API_BASE}/attachments/${attachment.id}/download`, {
          responseType: 'blob',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (cancelled) return;
        const typedBlob = new Blob([response.data], { type: attachment.mimeType });
        objectUrl = URL.createObjectURL(typedBlob);
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setPreviewError(true);
          toast.error('Impossibile caricare l\'anteprima');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, attachment.id, attachment.mimeType, isRenderable, toast]);

  const renderContent = () => {
    if (isLoading) return <Box sx={styles.loader}><CircularProgress /></Box>;
    if (previewError) return (
      <Box sx={styles.errorState}>
        <AlertCircle size={48} />
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={styles.errorTitle}>Anteprima non disponibile</Box>
          <Box sx={styles.errorSubtitle}>Impossibile caricare il file ({attachment.mimeType})</Box>
        </Box>
      </Box>
    );

    if (!previewUrl && isRenderable) return null;

    switch (category) {
      case 'image':
        return <Box component="img" src={previewUrl!} alt={attachment.fileName} sx={styles.mediaPreview} onError={() => setPreviewError(true)} />;
      case 'pdf':
      case 'text':
        return <Box component="iframe" src={previewUrl!} sx={styles.iframePreview} onError={() => setPreviewError(true)} />;
      case 'video':
        return <Box component="video" src={previewUrl!} controls sx={{ ...styles.mediaPreview, bgcolor: '#000' }} onError={() => setPreviewError(true)} />;
      case 'audio':
        return (
          <Box sx={styles.audioContainer}>
            <Box sx={styles.iconCircle}><Music size={40} color={theme.palette.primary.main} /></Box>
            <Box component="audio" src={previewUrl!} controls sx={{ width: '100%', maxWidth: 400 }} />
          </Box>
        );
      default:
        return (
          <Box sx={styles.errorState}>
            <Box sx={styles.iconCircle}><FileText size={40} color={theme.palette.primary.main} /></Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={styles.errorTitle}>Anteprima non disponibile</Box>
              <Box sx={styles.errorSubtitle}>Scarica il file per visualizzarlo ({attachment.mimeType})</Box>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: styles.paper }, backdrop: { sx: styles.backdrop } }}
    >
      <DialogTitle sx={styles.title}>
        <Box sx={styles.titleText}>{attachment.fileName}</Box>
        <IconButton onClick={onClose} size="small" sx={styles.closeButton}><X size={18} /></IconButton>
      </DialogTitle>
      <DialogContent sx={styles.content}>
        {renderContent()}
      </DialogContent>
    </Dialog>
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
    p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', m: 0
  } as SxProps<Theme>,
  titleText: {
    fontSize: '1rem', fontWeight: 600, color: 'text.primary',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
  } as SxProps<Theme>,
  closeButton: {
    ml: 1, color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
  } as SxProps<Theme>,
  content: {
    p: 3, maxHeight: 'calc(100vh - 140px)', overflow: 'auto',
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0, 191, 255, 0.3)', borderRadius: '4px' }
  } as SxProps<Theme>,
  loader: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300
  } as SxProps<Theme>,
  errorState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: 300, gap: 2, color: 'text.secondary'
  } as SxProps<Theme>,
  errorTitle: {
    fontSize: '0.875rem', fontWeight: 600, mb: 0.5
  } as SxProps<Theme>,
  errorSubtitle: {
    fontSize: '0.75rem'
  } as SxProps<Theme>,
  mediaPreview: {
    width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 2
  } as SxProps<Theme>,
  iframePreview: {
    width: '100%', height: '60vh', border: 'none', borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.02)'
  } as SxProps<Theme>,
  audioContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3
  } as SxProps<Theme>,
  iconCircle: {
    width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(0, 191, 255, 0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  } as SxProps<Theme>,
};
