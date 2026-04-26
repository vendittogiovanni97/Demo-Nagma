/**
 * Custom hook per gestione attachment
 * Logica di fetch, upload, delete, listing
 */

import { useToast } from '@/hooks/useToast';
import type { Attachment } from '@/types/attachment';
import { extractErrorMessage } from '@/utils/extract-error';
import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface UseAttachmentsOptions {
  bookingId?: string;
  enabled?: boolean;
}

/**
 * Hook per gestire list, upload, delete di attachment
 */
export function useAttachments({ bookingId, enabled = true }: UseAttachmentsOptions) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch lista attachment per booking
  const { data: attachments = [], isLoading, mutate } = useSWR<Attachment[]>(
    enabled && bookingId ? `/api/attachments/booking/${bookingId}` : null,
    async (url) => {
      const response = await axios.get(url);
      return response.data.data || [];
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 min
    }
  );

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
            headers: { 'Content-Type': 'multipart/form-data' },
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
        await mutate(); // Refresh list
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
    [bookingId, toast, mutate]
  );

  /**
   * Delete attachment
   * DELETE /api/attachments/:id
   */
  const deleteAttachment = useCallback(
    async (attachmentId: string): Promise<boolean> => {
      setDeleting(attachmentId);

      try {
        await axios.delete(`${API_BASE}/attachments/${attachmentId}`);
        toast.success('File eliminato');
        await mutate(); // Refresh list
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, 'Errore durante l\'eliminazione');
        toast.error(message);
        return false;
      } finally {
        setDeleting(null);
      }
    },
    [toast, mutate]
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
          { responseType: 'blob' }
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
    return mutate();
  }, [mutate]);

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
