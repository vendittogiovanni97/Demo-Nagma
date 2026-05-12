import { Request, Response, NextFunction } from 'express';
import prisma from '../../../shared/utils/prisma';
import { configService } from '../../../container';

export class ConfigController {
  // GET /api/config
  async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const SHOW_CONSENSI = await configService.getShowConsensi();
      const SHOW_POSIZIONAMENTO = await configService.getShowPosizionamento();
      const DEFAULT_PHONE_PREFIX = await configService.getDefaultPhonePrefix();
      res.json({ success: true, SHOW_CONSENSI, SHOW_POSIZIONAMENTO, DEFAULT_PHONE_PREFIX });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/config
  async updateConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { SHOW_CONSENSI, SHOW_POSIZIONAMENTO, DEFAULT_PHONE_PREFIX } = req.body;

      if (SHOW_CONSENSI !== undefined) {
        await configService.setValue('SHOW_CONSENSI', SHOW_CONSENSI.toString());
      }
      if (SHOW_POSIZIONAMENTO !== undefined) {
        await configService.setValue('SHOW_POSIZIONAMENTO', SHOW_POSIZIONAMENTO.toString());
      }
      if (DEFAULT_PHONE_PREFIX !== undefined) {
        await configService.setValue('DEFAULT_PHONE_PREFIX', DEFAULT_PHONE_PREFIX.toString());
      }

      res.json({
        success: true,
        message: 'Configurazione aggiornata con successo',
        data: {
          SHOW_CONSENSI: SHOW_CONSENSI !== undefined ? SHOW_CONSENSI.toString() === 'true' : undefined,
          SHOW_POSIZIONAMENTO: SHOW_POSIZIONAMENTO !== undefined ? SHOW_POSIZIONAMENTO.toString() === 'true' : undefined,
          DEFAULT_PHONE_PREFIX
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/config/backup
  async downloadBackup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        users: await prisma.user.findMany(),
        staff: await prisma.staff.findMany(),
        customers: await prisma.customer.findMany(),
        bookings: await prisma.booking.findMany(),
        creamTattoos: await prisma.creamTattoo.findMany(),
        creamSales: await prisma.creamSale.findMany(),
        transactions: await prisma.transaction.findMany(),
        formTemplates: await prisma.formTemplate.findMany(),
        speseLibere: await prisma.spesaLibera.findMany(),
        whatsAppTemplates: await prisma.whatsAppTemplate.findMany(),
        config: await prisma.config.findMany()
      };

      const filename = `nagma_backup_${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(JSON.stringify(backupData, null, 2));
    } catch (err) {
      next(err);
    }
  }
}
