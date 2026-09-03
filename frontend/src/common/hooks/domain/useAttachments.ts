import { useToast } from '@/common/hooks/useToast';
import type { Attachment } from '@/modules/booking/model/attachment.types';
import { API_BASE_URL } from '@/common/shared/api/endpoints';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';
import axios from 'axios';
import { useCallback, useState, useEffect } from 'react';

const API_BASE = `${API_BASE_URL}/api`;

interface UseAttachmentsOptions {
  bookingId?: string;
  enabled?: boolean;
  refreshTrigger?: number;
}

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
        withCredentials: true,
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
            withCredentials: true,
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
        await fetchAttachments();
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

  const deleteAttachment = useCallback(
    async (attachmentId: string): Promise<boolean> => {
      setDeleting(attachmentId);

      try {
        await axios.delete(`${API_BASE}/attachments/${attachmentId}`, {
          withCredentials: true,
        });
        toast.success('File eliminato');
        await fetchAttachments();
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

  const downloadAttachment = useCallback(
    async (attachmentId: string, fileName: string) => {
      try {
        const response = await axios.get(
          `${API_BASE}/attachments/${attachmentId}/download`,
          { responseType: 'blob', withCredentials: true }
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
