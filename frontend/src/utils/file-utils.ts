/**
 * Utility functions per gestione file
 */

import type { FileCategory, FileTypeInfo } from '@/types/attachment';

/**
 * Formatta file size in formato leggibile (B, KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Formatta timestamp ISO in formato locale
 * @param date - Date o ISO string
 * @param locale - 'it' per italiano, 'en' per inglese
 */
export function formatFileDate(date: Date | string, locale: 'it' | 'en' = 'it'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Estrai estensione file dal filename
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toUpperCase() || '?';
}

/**
 * Determina la categoria di file dal MIME type
 */
export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/')) return 'text';
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

/**
 * Ottieni info file (categoria, icona, displayName)
 */
export function getFileTypeInfo(mimeType: string): FileTypeInfo {
  const category = getFileCategory(mimeType);

  const info: Record<FileCategory, Omit<FileTypeInfo, 'category'>> = {
    pdf: { icon: 'FilePdf', displayName: 'PDF Document' },
    image: { icon: 'Image', displayName: 'Image' },
    video: { icon: 'Video', displayName: 'Video' },
    audio: { icon: 'Music', displayName: 'Audio' },
    document: { icon: 'FileText', displayName: 'Document' },
    text: { icon: 'FileText', displayName: 'Text File' },
    other: { icon: 'File', displayName: 'File' },
  };

  const typeInfo = info[category];
  return {
    category,
    ...typeInfo,
  };
}

/**
 * Valida file prima di upload
 * @returns null se valido, stringa errore se invalido
 */
export function validateFile(
  file: File,
  maxSizeBytes: number = 10 * 1024 * 1024,
  allowedTypes: string[] = []
): string | null {
  // Controlla size
  if (file.size > maxSizeBytes) {
    return `File troppo grande (max ${formatFileSize(maxSizeBytes)}, ricevuto ${formatFileSize(file.size)})`;
  }

  // Controlla tipo se specificato
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `Tipo di file non supportato: ${file.type || 'sconosciuto'}`;
  }

  // Controlla che il file non sia vuoto
  if (file.size === 0) {
    return 'Il file è vuoto';
  }

  return null;
}

/**
 * Converti File a Base64 (per anteprima)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Trigger browser download di un Blob
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Crea preview URL per file
 * Utile per rendering in tag img/video/audio
 */
export function createPreviewUrl(attachment: { id: string }): string {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  return `${API_BASE}/attachments/${attachment.id}/preview`;
}

/**
 * Crea download URL per file
 */
export function createDownloadUrl(attachment: { id: string }): string {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  return `${API_BASE}/attachments/${attachment.id}/download`;
}

/**
 * Abbrevia filename se troppo lungo
 */
export function truncateFileName(fileName: string, maxLength: number = 30): string {
  if (fileName.length <= maxLength) return fileName;

  const ext = getFileExtension(fileName);
  const name = fileName.slice(0, fileName.lastIndexOf('.'));
  const extLength = ext.length + 1; // +1 per il punto

  const available = maxLength - extLength - 3; // -3 per "..."
  return `${name.slice(0, available)}...${ext}`;
}

/**
 * Verifica se il file è un'immagine
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Verifica se il file è un PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Verifica se il file è un video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Verifica se il file è audio
 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

/**
 * Mappa MIME type a estensione file
 */
export function mimeTypeToExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'text/plain': 'txt',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };

  return mimeMap[mimeType] || 'file';
}
