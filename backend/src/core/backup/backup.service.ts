import nodemailer from 'nodemailer';
import prisma from '../shared/utils/prisma';
import { logger } from '../shared/utils/logger';

export interface BackupMetadata {
  version: string;
  timestamp: string;
  databaseName: string;
  totalCollections: number;
  totalDocuments: number;
}

export interface BackupDumpPayload {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

export interface BackupResult {
  buffer: Buffer;
  filename: string;
  metadata: BackupMetadata;
  dumpPayload: BackupDumpPayload;
}

export class BackupService {
  /**
   * Estrae tutti i dati di tutte le collezioni/tabelle del database attivo,
   * crea il payload serializzato e genera un Buffer con file .dump.
   */
  async createDump(): Promise<BackupResult> {
    const databaseUrl = process.env.DATABASE_URL || '';
    let dbName = 'nagmadb';
    try {
      if (databaseUrl) {
        const url = new URL(databaseUrl);
        dbName = url.pathname.replace(/^\//, '') || 'nagmadb';
      }
    } catch {
      // fallback dbName
    }

    const modelNames = [
      'user',
      'staff',
      'shift',
      'customer',
      'booking',
      'creamTattoo',
      'creamSale',
      'bookingHistory',
      'transaction',
      'transactionHistory',
      'formTemplate',
      'spesaLibera',
      'entrataLibera',
      'whatsAppTemplate',
      'whatsAppMessageLog',
      'config',
      'clientConfig',
      'customField',
      'attachment',
      'bookingPlacement',
      'userPreference',
      'savedView',
    ];

    const dataSnapshot: Record<string, any[]> = {};
    let totalDocuments = 0;
    let totalCollections = 0;

    for (const modelKey of modelNames) {
      const clientModel = (prisma as any)[modelKey];
      if (clientModel && typeof clientModel.findMany === 'function') {
        try {
          const records = await clientModel.findMany();
          dataSnapshot[modelKey] = records;
          totalCollections += 1;
          totalDocuments += records.length;
        } catch (err) {
          logger.warn(`[BackupService] Impossibile estrarre la collezione ${modelKey}`, { error: err });
          dataSnapshot[modelKey] = [];
        }
      }
    }

    const now = new Date();
    const isoTimestamp = now.toISOString();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}_${hours}-${minutes}`;

    const filename = `backup_database_${formattedDate}.dump`;

    const metadata: BackupMetadata = {
      version: '1.0',
      timestamp: isoTimestamp,
      databaseName: dbName,
      totalCollections,
      totalDocuments,
    };

    const dumpPayload: BackupDumpPayload = {
      metadata,
      data: dataSnapshot,
    };

    const dumpContent = JSON.stringify(dumpPayload, null, 2);
    const buffer = Buffer.from(dumpContent, 'utf-8');

    return {
      buffer,
      filename,
      metadata,
      dumpPayload,
    };
  }

  /**
   * Invia un'email formattata con allegato .dump tramite SMTP (Nodemailer).
   */
  async sendBackupEmail(dumpResult: BackupResult): Promise<void> {
    const smtpHost = process.env.SMTP_HOST || 'localhost';
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const mailFrom = process.env.MAIL_FROM || 'backup@nagma.studio';
    const mailTo = process.env.MAIL_TO || process.env.SMTP_USER || 'admin@nagma.studio';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
    });

    const { metadata, filename, buffer } = dumpResult;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 12px; border: 1px solid #30363d; overflow: hidden; }
          .header { background: linear-gradient(135deg, #00bfff, #7b2cbf); padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .body-content { padding: 24px; }
          .stat-card { background: #21262d; border-radius: 8px; border: 1px solid #30363d; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; }
          .stat-label { color: #8b949e; font-size: 14px; }
          .stat-value { color: #58a6ff; font-weight: 700; font-size: 16px; }
          .footer { background: #0d1117; padding: 16px; text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💾 Backup Completo del Database</h1>
          </div>
          <div class="body-content">
            <p>È stato generato ed allegato con successo il dump completo del database del sistema.</p>
            <div class="stat-card">
              <span class="stat-label">📅 Timestamp ISO</span>
              <span class="stat-value">${metadata.timestamp}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">🗄️ Database</span>
              <span class="stat-value">${metadata.databaseName}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">📁 Collezioni / Tabelle</span>
              <span class="stat-value">${metadata.totalCollections}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">📄 Record Totali</span>
              <span class="stat-value">${metadata.totalDocuments}</span>
            </div>
            <p style="font-size: 13px; color: #8b949e; margin-top: 16px;">
              Il file allegato <strong>${filename}</strong> contiene l'intero snapshot dei dati ed è pronto per l'uso con lo script di ripristino <code>npm run db:restore</code>.
            </p>
          </div>
          <div class="footer">
            Nagma Studio &bull; Automated Database Backup System
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: `💾 Database Dump: ${filename}`,
      html: htmlTemplate,
      attachments: [
        {
          filename,
          content: buffer,
          contentType: 'application/octet-stream',
        },
      ],
    });

    logger.info('[BackupService] Email con allegato .dump inviata con successo', {
      to: mailTo,
      filename,
      sizeBytes: buffer.length,
    });
  }

  /**
   * Esegue il backup e l'invio email in background all'avvio del server.
   * Rispetta la variabile BACKUP_EMAIL_ALL_AVVIO ed evita di bloccare il processo.
   */
  async createAndSendBackupEmail(): Promise<void> {
    const isEnabled = (process.env.BACKUP_EMAIL_ALL_AVVIO ?? 'true').toLowerCase() === 'true';

    if (!isEnabled) {
      logger.info('[BackupService] BACKUP_EMAIL_ALL_AVVIO è impostato su false. Invio email all\'avvio saltato.');
      return;
    }

    try {
      logger.info('[BackupService] Avvio generazione dump e invio email backup in background...');
      const dumpResult = await this.createDump();
      await this.sendBackupEmail(dumpResult);
    } catch (error) {
      logger.warn('[BackupService] Impossibile completare l\'invio email di backup all\'avvio', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const backupService = new BackupService();
