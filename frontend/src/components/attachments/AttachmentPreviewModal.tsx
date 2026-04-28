"use client";

import type { Attachment } from '@/types/attachment';
import { getToken } from '@/utils/auth';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { X, FileText, Music, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';

interface AttachmentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  attachment: Attachment;
}

/**
 * Determina la categoria del file dal MIME type
 */
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('text')) return 'text';
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('presentation') ||
    mimeType.includes('sheet') ||
    mimeType.includes('excel')
  ) {
    return 'document';
  }
  return 'other';
}

export default function AttachmentPreviewModal({
  open,
  onClose,
  attachment,
}: AttachmentPreviewModalProps) {
  const theme = useTheme();
  const toast = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const category = getFileCategory(attachment.mimeType);

  // Categorie renderizzabili nativamente dal browser tramite blob URL.
  // Document/other non hanno preview reale — mostriamo direttamente il
  // fallback "Scarica il file" senza fetch.
  const isRenderable = ['image', 'pdf', 'video', 'audio', 'text'].includes(category);

  // Scarichiamo il file con il JWT come blob e creiamo un Object URL — i tag
  // <img>/<iframe>/<video>/<audio> non possono passare header custom.
  // Usiamo l'endpoint /download (che restituisce il file reale) invece di
  // /preview (che il backend serve come placeholder SVG, vedi backend/src/utils/preview.ts).
  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      return;
    }

    setPreviewError(false);

    if (!isRenderable) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const token = getToken();
        const response = await axios.get(
          `${API_BASE}/attachments/${attachment.id}/download`,
          {
            responseType: 'blob',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        if (cancelled) return;
        // Forziamo il MIME type sul blob: alcuni endpoint download impostano
        // application/octet-stream e iframe/video non lo renderizzano.
        const typedBlob = new Blob([response.data], { type: attachment.mimeType });
        objectUrl = URL.createObjectURL(typedBlob);
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setPreviewError(true);
          toast.error('Impossibile caricare l\'anteprima del file');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, attachment.id, attachment.mimeType, isRenderable]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
          }}
        >
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      );
    }

    if (previewError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            gap: 2,
            color: theme.palette.text.secondary,
          }}
        >
          <AlertCircle size={48} strokeWidth={1.5} />
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
              Anteprima non disponibile
            </Box>
            <Box sx={{ fontSize: '0.75rem' }}>
              Impossibile caricare il file ({attachment.mimeType})
            </Box>
          </Box>
        </Box>
      );
    }

    if (!previewUrl) return null;

    switch (category) {
      case 'image':
        return (
          <Box
            component="img"
            src={previewUrl || undefined}
            onError={() => setPreviewError(true)}
            alt={attachment.fileName}
            sx={{
              width: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        );

      case 'pdf':
        return (
          <Box
            component="iframe"
            src={previewUrl || undefined}
            onError={() => setPreviewError(true)}
            sx={{
              width: '100%',
              height: '60vh',
              border: 'none',
              borderRadius: '8px',
            }}
          />
        );

      case 'video':
        return (
          <Box
            component="video"
            src={previewUrl || undefined}
            controls
            onError={() => setPreviewError(true)}
            sx={{
              width: '100%',
              maxHeight: '60vh',
              borderRadius: '8px',
              backgroundColor: '#000',
            }}
          />
        );

      case 'audio':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 191, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Music size={40} color={theme.palette.primary.main} strokeWidth={1.5} />
            </Box>
            <Box
              component="audio"
              src={previewUrl || undefined}
              controls
              onError={() => setPreviewError(true)}
              style={{ width: '100%', maxWidth: '400px' }}
            />
          </Box>
        );

      case 'text':
        return (
          <Box
            component="iframe"
            src={previewUrl || undefined}
            onError={() => setPreviewError(true)}
            sx={{
              width: '100%',
              height: '60vh',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
          />
        );

      case 'document':
      case 'other':
      default:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              gap: 2,
              color: theme.palette.text.secondary,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 191, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={40} color={theme.palette.primary.main} strokeWidth={1.5} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
                Anteprima non disponibile
              </Box>
              <Box sx={{ fontSize: '0.75rem' }}>
                Scarica il file per visualizzarlo ({attachment.mimeType})
              </Box>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          fontSize: '1rem',
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
        <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {attachment.fileName}
        </Box>
        <IconButton
          onClick={onClose}
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
          maxHeight: 'calc(100vh - 140px)',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 191, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 191, 255, 0.5)',
            },
          },
        }}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
