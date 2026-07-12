import path from 'path';
import fs from 'fs';
import { logger } from './logger';

const PREVIEW_CACHE_DIR = path.resolve('./uploads/previews');

/**
 * Placeholder SVG icons per diversi tipi di file
 */
const PLACEHOLDER_ICONS = {
  pdf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#f44336"/>
    <text x="50" y="65" font-size="40" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
  </svg>`,

  document: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#2196f3"/>
    <text x="50" y="65" font-size="30" font-weight="bold" fill="white" text-anchor="middle">DOC</text>
  </svg>`,

  image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#4caf50"/>
    <text x="50" y="65" font-size="30" font-weight="bold" fill="white" text-anchor="middle">IMG</text>
  </svg>`,

  video: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#ff9800"/>
    <text x="50" y="65" font-size="30" font-weight="bold" fill="white" text-anchor="middle">VID</text>
  </svg>`,

  default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#9c27b0"/>
    <text x="50" y="65" font-size="30" font-weight="bold" fill="white" text-anchor="middle">FILE</text>
  </svg>`,
};

export class PreviewManager {
  /**
   * Genera una preview per un file
   * Usa cache indefinita per PDF, oppure placeholder SVG per altri tipi
   */
  static async generatePreview(
    filePath: string,
    mimeType: string,
    attachmentId: string,
  ): Promise<{ previewPath: string; isPlaceholder: boolean }> {
    try {
      // Assicura che la directory dei preview esista
      await fs.promises.mkdir(PREVIEW_CACHE_DIR, { recursive: true });

      // Per documenti di testo, immagini e video, usa placeholder
      // In produzione, qui si potrebbe integrare pdf2pic, ffmpeg, LibreOffice, etc.
      const placeholderType = this.getPlaceholderType(mimeType);
      const svgIcon = PLACEHOLDER_ICONS[placeholderType];

      const previewFileName = `${attachmentId}.preview.svg`;
      const previewPath = path.join(PREVIEW_CACHE_DIR, previewFileName);

      await fs.promises.writeFile(previewPath, svgIcon);

      logger.info('Preview generata con successo', { attachmentId, mimeType });

      return { previewPath, isPlaceholder: true };
    } catch (error) {
      logger.errorWithStack('Errore generazione preview', error, { attachmentId, mimeType });

      // Fallback: ritorna placeholder anche se non riesce a salvare
      return { previewPath: '', isPlaceholder: true };
    }
  }

  /**
   * Ottiene la preview di un file (se esiste)
   */
  static async getPreview(attachmentId: string): Promise<string | null> {
    try {
      const previewPath = path.join(PREVIEW_CACHE_DIR, `${attachmentId}.preview.svg`);
      const exists = await fs.promises
        .access(previewPath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        const content = await fs.promises.readFile(previewPath, 'utf-8');
        return content;
      }

      return null;
    } catch (error) {
      logger.errorWithStack('Errore lettura preview', error, { attachmentId });
      return null;
    }
  }

  /**
   * Determina il tipo di placeholder basato su MIME type
   */
  private static getPlaceholderType(
    mimeType: string,
  ): keyof typeof PLACEHOLDER_ICONS {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    return 'default';
  }
}
