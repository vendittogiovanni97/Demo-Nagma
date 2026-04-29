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
   * Salva un file nel filesystem con nome casuale (UUID)
   * FIX #5: Previene path traversal e collision attacks
   *
   * @param buffer - contenuto del file
   * @param originalFileName - nome file originale (usato SOLO per estrarre estensione)
   * @returns percorso salvo del file
   */
  static async saveFile(buffer: Buffer, originalFileName: string): Promise<{ filePath: string; fileName: string }> {
    try {
      await this.ensureUploadsDir();

      // FIX #5: Extract extension safely (ignora il nome file user-provided)
      let ext = path.extname(originalFileName).toLowerCase();

      // FIX #5: Validate extension is not dangerous (defense in depth)
      // Estensioni pericolose che potrebbero causare problemi anche se salvate
      const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.dll', '.sh', '.bash', '.ps1', '.com', '.scr'];
      if (DANGEROUS_EXTENSIONS.includes(ext)) {
        logger.warn('Tentativo upload file con estensione pericolosa', {
          originalFileName,
          extension: ext,
        });
        // Forza salvataggio come .bin
        ext = '.bin';
      }

      // FIX #5: Usa UUID per nome file (non user-provided name)
      // Questo previene path traversal: user non può mettere "../../../etc/passwd"
      const fileName = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      await fs.promises.writeFile(filePath, buffer);

      logger.info('File salvato con successo (FIX #5: UUID naming)', {
        filePath,
        fileName,
        originalFileName, // logged per audit, non usato in percorso
      });

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
