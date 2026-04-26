"use client";

import { useAttachments } from '@/hooks/domain/useAttachments';
import type { Attachment } from '@/types/attachment';
import {
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { Download, Eye, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import AttachmentPreviewModal from './AttachmentPreviewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

interface AttachmentListProps {
  bookingId: string;
  refresh?: boolean;
  onRefresh?: () => void;
}

/**
 * Formatta file size in formato leggibile
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Formatta timestamp
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Estrai estensione file
 */
function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toUpperCase() || '?';
}

export default function AttachmentList({
  bookingId,
  refresh,
  onRefresh,
}: AttachmentListProps) {
  const theme = useTheme();
  const {
    attachments,
    isLoading,
    deleting,
    deleteAttachment,
    downloadAttachment,
  } = useAttachments({
    bookingId,
    enabled: !!bookingId,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Refresh quando refresh prop cambia
  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

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
      if (success) {
        handleRefresh();
      }
    }
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
  }, [pendingDeleteId, deleteAttachment, handleRefresh]);

  const handleDownload = useCallback(
    (attachment: Attachment) => {
      downloadAttachment(attachment.id, attachment.fileName);
    },
    [downloadAttachment]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (attachments.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          border: `1px solid rgba(255, 255, 255, 0.06)`,
        }}
      >
        <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
          Nessun allegato caricato
        </Box>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        sx={{
          borderRadius: '8px',
          border: `1px solid rgba(255, 255, 255, 0.06)`,
          overflow: 'hidden',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderBottom: `1px solid rgba(255, 255, 255, 0.06)`,
                '& th': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  p: 1.5,
                },
              }}
            >
              <TableCell>Nome file</TableCell>
              <TableCell align="right">Dimensione</TableCell>
              <TableCell align="right">Data caricamento</TableCell>
              <TableCell align="center">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attachments.map((attachment) => (
              <TableRow
                key={attachment.id}
                sx={{
                  borderBottom: `1px solid rgba(255, 255, 255, 0.06)`,
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  },
                  '& td': {
                    p: 1.5,
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '6px',
                        backgroundColor: 'rgba(0, 191, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: theme.palette.primary.main,
                      }}
                    >
                      {getFileExtension(attachment.fileName)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={attachment.fileName}
                      >
                        {attachment.fileName}
                      </Box>
                      <Box
                        sx={{
                          fontSize: '0.65rem',
                          color: theme.palette.text.secondary,
                          mt: 0.25,
                        }}
                      >
                        {attachment.mimeType}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                    {formatFileSize(attachment.fileSize)}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                    {formatDate(attachment.createdAt)}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(attachment)}
                      disabled={deleting === attachment.id}
                      sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 191, 255, 0.1)',
                        },
                        '&:disabled': {
                          opacity: 0.5,
                        },
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(attachment)}
                      disabled={deleting === attachment.id}
                      sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 191, 255, 0.1)',
                        },
                        '&:disabled': {
                          opacity: 0.5,
                        },
                      }}
                    >
                      <Download size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(attachment.id)}
                      disabled={deleting === attachment.id || deleting !== null}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                        '&:disabled': {
                          opacity: 0.5,
                        },
                      }}
                    >
                      {deleting === attachment.id ? (
                        <CircularProgress size={16} sx={{ color: 'inherit' }} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Preview Modal */}
      {selectedAttachment && (
        <AttachmentPreviewModal
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedAttachment(null);
          }}
          attachment={selectedAttachment}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Elimina allegato"
        message={`Sei sicuro di voler eliminare "${selectedAttachment?.fileName}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}
