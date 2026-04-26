/**
 * Attachment type definitions
 * Sincronizzato con backend schema
 */

export interface Attachment {
  id: string;
  bookingId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AttachmentDetail extends Attachment {
  preview: string | null;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  loaded: number;
  total: number;
}

export type FileCategory = 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'text' | 'other';

export interface FileTypeInfo {
  category: FileCategory;
  icon: string;
  displayName: string;
}
