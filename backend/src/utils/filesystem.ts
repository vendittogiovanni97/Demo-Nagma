import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

const UPLOADS_DIR = path.resolve('./uploads/attachments');

export class FileSystemManager {
  /**
   * Crea la directory uploads se non esiste
   * Gestisce race condition con { recursive: true }
   */
  static async ensureUploadsDir(): Promise<void> {
    try {
      await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (error) {
      logger.error('Errore creazione directory uploads', { error });
      throw error;
    }
  }

  /**
   * Salva un file nel filesystem
   * @param buffer - contenuto del file
   * @param originalFileName - nome file originale (usato per estrarre estensione)
   * @returns percorso salvo del file
   */
  static async saveFile(buffer: Buffer, originalFileName: string): Promise<{ filePath: string; fileName: string }> {
    try {
      await this.ensureUploadsDir();

      const ext = path.extname(originalFileName);
      const fileName = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      await fs.promises.writeFile(filePath, buffer);

      logger.info('File salvato con successo', { filePath, fileName });

      return { filePath, fileName };
    } catch (error) {
      logger.errorWithStack('Errore salvataggio file', error);
      throw error;
    }
  }

  /**
   * Legge un file dal filesystem
   * @param filePath - percorso file
   * @returns contenuto file
   */
  static async readFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      logger.errorWithStack('Errore lettura file', error);
      throw error;
    }
  }

  /**
   * Verifica se un file esiste
   * @param filePath - percorso file
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Elimina un file dal filesystem
   * @param filePath - percorso file
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const exists = await this.fileExists(filePath);
      if (exists) {
        await fs.promises.unlink(filePath);
        logger.info('File eliminato con successo', { filePath });
      }
    } catch (error) {
      logger.errorWithStack('Errore eliminazione file', error);
      throw error;
    }
  }

  /**
   * Ottiene metadati file
   * @param filePath - percorso file
   */
  static async getFileStats(filePath: string): Promise<fs.Stats> {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      logger.errorWithStack('Errore lettura stats file', error);
      throw error;
    }
  }
}
