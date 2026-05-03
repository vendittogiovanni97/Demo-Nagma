"use client";

import React, { useCallback, useState } from 'react';
import {
  Box, CircularProgress, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useTheme, SxProps, Theme, Typography
} from '@mui/material';
import { Download, Eye, Trash2 } from 'lucide-react';

// Hooks & Types
import { useAttachments } from '@/hooks/domain/useAttachments';
import type { Attachment } from '@/modules/booking/model/attachment.types';

// Components
import AttachmentPreviewModal from './AttachmentPreviewModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface AttachmentListProps {
  bookingId: string;
  onRefresh?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toUpperCase() || '?';
}

export default function AttachmentList({ bookingId, onRefresh }: AttachmentListProps) {
  const theme = useTheme();
  const { attachments, isLoading, deleting, deleteAttachment, downloadAttachment } = useAttachments({
    bookingId, enabled: !!bookingId,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handlePreview = useCallback((attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setPreviewOpen(true);
  }, []);

  const handleDeleteClick = useCallback((attachmentId: string) => {
    setPendingDeleteId(attachmentId);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteId) {
      const success = await deleteAttachment(pendingDeleteId);
      if (success) onRefresh?.();
    }
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
  }, [pendingDeleteId, deleteAttachment, onRefresh]);

  if (isLoading) {
    return (
      <Box sx={styles.loaderContainer}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (attachments.length === 0) {
    return (
      <Box sx={styles.emptyState}>
        <Typography variant="body2" color="text.secondary">Nessun allegato caricato</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer sx={styles.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow sx={styles.headRow}>
              <TableCell>Nome file</TableCell>
              <TableCell align="right" sx={styles.hideMobile}>Dimensione</TableCell>
              <TableCell align="right" sx={styles.hideTablet}>Data caricamento</TableCell>
              <TableCell align="center">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attachments.map((attachment) => (
              <TableRow key={attachment.id} sx={styles.bodyRow}>
                <TableCell>
                  <Box sx={styles.fileInfo}>
                    <Box sx={styles.extensionBadge}>
                      {getFileExtension(attachment.fileName)}
                    </Box>
                    <Box sx={styles.fileNameGroup}>
                      <Box sx={styles.fileName} title={attachment.fileName}>
                        {attachment.fileName}
                      </Box>
                      <Box sx={styles.mimeType}>{attachment.mimeType}</Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={styles.hideMobile}>
                  <Typography variant="body2">{formatFileSize(attachment.fileSize)}</Typography>
                </TableCell>
                <TableCell align="right" sx={styles.hideTablet}>
                  <Typography variant="body2" color="text.secondary">{formatDate(attachment.createdAt)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={styles.actions}>
                    <IconButton size="small" onClick={() => handlePreview(attachment)} sx={styles.actionButton('primary')}>
                      <Eye size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => downloadAttachment(attachment.id, attachment.fileName)} sx={styles.actionButton('primary')}>
                      <Download size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(attachment.id)} disabled={deleting !== null} sx={styles.actionButton('error')}>
                      {deleting === attachment.id ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedAttachment && (
        <AttachmentPreviewModal
          open={previewOpen}
          attachment={selectedAttachment}
          onClose={() => { setPreviewOpen(false); setSelectedAttachment(null); }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Elimina allegato"
        message={`Sei sicuro di voler eliminare "${attachments.find(a => a.id === pendingDeleteId)?.fileName ?? ''}"? Questa azione non può essere annullata.`}
        confirmText="Elimina" isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setPendingDeleteId(null); }}
      />
    </>
  );
}

const styles = {
  loaderContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200
  } as SxProps<Theme>,
  emptyState: {
    p: 4, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.06)'
  } as SxProps<Theme>,
  tableContainer: {
    borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.06)', overflowX: 'auto',
    '&::-webkit-scrollbar': { height: '6px' },
    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0, 191, 255, 0.3)', borderRadius: '3px' }
  } as SxProps<Theme>,
  headRow: {
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    '& th': {
      color: 'primary.main', fontWeight: 700, fontSize: '0.7rem',
      textTransform: 'uppercase', letterSpacing: '0.1em', p: 2
    }
  } as SxProps<Theme>,
  bodyRow: {
    '& td': { p: 2 },
    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
    transition: 'bgcolor 0.2s ease'
  } as SxProps<Theme>,
  fileInfo: {
    display: 'flex', alignItems: 'center', gap: 1.5
  } as SxProps<Theme>,
  extensionBadge: {
    width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(0, 191, 255, 0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', fontWeight: 800, color: 'primary.main', border: '1px solid rgba(0, 191, 255, 0.1)'
  } as SxProps<Theme>,
  fileNameGroup: {
    flex: 1, minWidth: 0
  } as SxProps<Theme>,
  fileName: {
    fontSize: '0.875rem', fontWeight: 600, color: 'text.primary',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
  } as SxProps<Theme>,
  mimeType: {
    fontSize: '0.65rem', color: 'text.secondary', mt: 0.25
  } as SxProps<Theme>,
  actions: {
    display: 'flex', justifyContent: 'center', gap: 1
  } as SxProps<Theme>,
  actionButton: (variant: 'primary' | 'error') => ({
    color: variant === 'primary' ? 'primary.main' : 'error.main',
    '&:hover': { bgcolor: variant === 'primary' ? 'rgba(0, 191, 255, 0.1)' : 'rgba(244, 67, 54, 0.1)' },
    '&:disabled': { opacity: 0.5 }
  } as SxProps<Theme>),
  hideMobile: {
    display: { xs: 'none', sm: 'table-cell' }
  } as SxProps<Theme>,
  hideTablet: {
    display: { xs: 'none', md: 'table-cell' }
  } as SxProps<Theme>,
};
