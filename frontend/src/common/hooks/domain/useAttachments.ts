/**
 * Custom hook per gestione attachment
 * Logica di fetch, upload, delete, listing
 */

import { useToast } from '@/common/hooks/useToast';
import type { Attachment } from '@/modules/booking/model/attachment.types';
import { getToken } from '@/common/shared/utils/auth';
import { API_BASE_URL } from '@/common/shared/api/endpoints';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';
import axios from 'axios';
import { useCallback, useState, useEffect } from 'react';

// Usa la stessa base del resto dell'app (NEXT_PUBLIC_API_BASE_URL), non una var inesistente.
const API_BASE = `${API_BASE_URL}/api`;

/**
 * Costruisce gli headers di autenticazione per le chiamate axios.
 * Allineato con apiClient (`/api/client.ts`) che usa JWT Bearer.
 */
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra;
}

interface UseAttachmentsOptions {
  bookingId?: string;
  enabled?: boolean;
  refreshTrigger?: number;
}

/**
 * Hook per gestire list, upload, delete di attachment
 */
export function useAttachments({ bookingId, enabled = true, refreshTrigger }: UseAttachmentsOptions) {
  const toast = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAttachments = useCallback(async () => {
    if (!enabled || !bookingId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/attachments/booking/${bookingId}`, { 
        headers: authHeaders() 
      });
      setAttachments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, enabled]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments, refreshTrigger]);

  /**
   * Upload file verso API
   * POST /api/attachments/upload?bookingId=X
   */
  const uploadFile = useCallback(
    async (file: File, onProgress?: (progress: number) => void): Promise<Attachment | null> => {
      if (!bookingId) {
        toast.error('Booking ID mancante');
        return null;
      }

      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `${API_BASE}/attachments/upload?bookingId=${bookingId}`,
          formData,
          {
            headers: authHeaders({ 'Content-Type': 'multipart/form-data' }),
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / (progressEvent.total || 1)) * 100
              );
              setUploadProgress(progress);
              onProgress?.(progress);
            },
          }
        );

        toast.success(`${file.name} caricato con successo`);
        await fetchAttachments(); // Refresh list
        return response.data.data;
      } catch (error) {
        const message = extractErrorMessage(error, 'Errore durante il caricamento');
        toast.error(message);
        return null;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [bookingId, toast, fetchAttachments]
  );

  /**
   * Delete attachment
   * DELETE /api/attachments/:id
   */
  const deleteAttachment = useCallback(
    async (attachmentId: string): Promise<boolean> => {
      setDeleting(attachmentId);

      try {
        await axios.delete(`${API_BASE}/attachments/${attachmentId}`, {
          headers: authHeaders(),
        });
        toast.success('File eliminato');
        await fetchAttachments(); // Refresh list
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, 'Errore durante l\'eliminazione');
        toast.error(message);
        return false;
      } finally {
        setDeleting(null);
      }
    },
    [toast, fetchAttachments]
  );

  /**
   * Download file (trigger browser download)
   * GET /api/attachments/:id/download
   */
  const downloadAttachment = useCallback(
    async (attachmentId: string, fileName: string) => {
      try {
        const response = await axios.get(
          `${API_BASE}/attachments/${attachmentId}/download`,
          { responseType: 'blob', headers: authHeaders() }
        );

        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        const message = extractErrorMessage(error, 'Errore durante il download');
        toast.error(message);
      }
    },
    [toast]
  );

  /**
   * Refresh lista attachment manualmente
   */
  const refreshList = useCallback(() => {
    return fetchAttachments();
  }, [fetchAttachments]);

  return {
    attachments,
    isLoading,
    uploading,
    uploadProgress,
    deleting,
    uploadFile,
    deleteAttachment,
    downloadAttachment,
    refreshList,
  };
}
