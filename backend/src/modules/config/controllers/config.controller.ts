import { Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { ConfigService } from '../services/configService';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import prisma from '../../../core/shared/utils/prisma';

export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  getConfig = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const SHOW_CONSENSI = await this.configService.getShowConsensi();
    const SHOW_POSIZIONAMENTO = await this.configService.getShowPosizionamento();
    const DEFAULT_PHONE_PREFIX = await this.configService.getDefaultPhonePrefix();
    res.json({ success: true, SHOW_CONSENSI, SHOW_POSIZIONAMENTO, DEFAULT_PHONE_PREFIX });
  });

  updateConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { SHOW_CONSENSI, SHOW_POSIZIONAMENTO, DEFAULT_PHONE_PREFIX } = req.body;

    if (SHOW_CONSENSI !== undefined) {
      await this.configService.setValue('SHOW_CONSENSI', SHOW_CONSENSI.toString());
    }
    if (SHOW_POSIZIONAMENTO !== undefined) {
      await this.configService.setValue('SHOW_POSIZIONAMENTO', SHOW_POSIZIONAMENTO.toString());
    }
    if (DEFAULT_PHONE_PREFIX !== undefined) {
      await this.configService.setValue('DEFAULT_PHONE_PREFIX', DEFAULT_PHONE_PREFIX.toString());
    }

    res.json({
      success: true,
      message: 'Configurazione aggiornata con successo',
      data: {
        SHOW_CONSENSI: SHOW_CONSENSI !== undefined ? SHOW_CONSENSI.toString() === 'true' : undefined,
        SHOW_POSIZIONAMENTO: SHOW_POSIZIONAMENTO !== undefined ? SHOW_POSIZIONAMENTO.toString() === 'true' : undefined,
        DEFAULT_PHONE_PREFIX,
      },
    });
  });

  downloadBackup = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = {
      User: await prisma.user.findMany(),
      Staff: await prisma.staff.findMany(),
      Shift: await prisma.shift.findMany(),
      Customer: await prisma.customer.findMany(),
      Booking: await prisma.booking.findMany(),
      CreamTattoo: await prisma.creamTattoo.findMany(),
      CreamSale: await prisma.creamSale.findMany(),
      BookingHistory: await prisma.bookingHistory.findMany(),
      Transaction: await prisma.transaction.findMany(),
      TransactionHistory: await prisma.transactionHistory.findMany(),
      FormTemplate: await prisma.formTemplate.findMany(),
      SpesaLibera: await prisma.spesaLibera.findMany(),
      WhatsAppTemplate: await prisma.whatsAppTemplate.findMany(),
      WhatsAppMessageLog: await prisma.whatsAppMessageLog.findMany(),
      Config: await prisma.config.findMany(),
      Attachment: await prisma.attachment.findMany(),
      BookingPlacement: await prisma.bookingPlacement.findMany(),
    };

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}_${mm}_${yyyy}`;
    const filename = `nagma_backup_${dateStr}.sql`;

    let sql = `-- ==========================================================\n`;
    sql += `-- NAGMA STUDIO DATABASE BACKUP (.SQL)\n`;
    sql += `-- Exported At: ${now.toISOString()}\n`;
    sql += `-- ==========================================================\n\n`;
    sql += `SET session_replication_role = 'replica';\n\n`;

    const escapeSqlValue = (val: any): string => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
      if (typeof val === 'number') return val.toString();
      if (val instanceof Date) return `'${val.toISOString()}'`;
      if (typeof val === 'object') {
        if (typeof val.toISOString === 'function') {
          return `'${val.toISOString()}'`;
        }
        return `'${JSON.stringify(val).replace(/'/g, "'")}'`;
      }
      return `'${val.toString().replace(/'/g, "'")}'`;
    };

    for (const [tableName, records] of Object.entries(data)) {
      sql += `-- ----------------------------------------------------------\n`;
      sql += `-- Table: "${tableName}"\n`;
      sql += `-- ----------------------------------------------------------\n`;
      sql += `TRUNCATE TABLE "${tableName}" CASCADE;\n`;

      if ((records as any[]).length > 0) {
        (records as any[]).forEach((rec: any) => {
          const columns = Object.keys(rec);
          const values = Object.values(rec).map(escapeSqlValue);
          sql += `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
        });
      } else {
        sql += `-- (No records)\n`;
      }
      sql += `\n`;
    }

    sql += `SET session_replication_role = 'origin';\n`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(sql);
  });
}
