import { Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { ConfigService, ClientFeatures } from '../services/configService';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { clearFeatureCache } from '../../../core/middleware/featureFlag.middleware';
import { DatabaseBackupService } from '../services/databaseBackupService';

export class ConfigController {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseBackupService: DatabaseBackupService
  ) {}

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
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}_${mm}_${yyyy}`;
    const filename = `nagma_backup_${dateStr}.sql`;

    const sql = await this.databaseBackupService.buildSqlBackup(now);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(sql);
  });

  // Nuovo: ClientConfig endpoints
  getClientConfig = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const clientConfig = await this.configService.getClientConfig();
    if (!clientConfig) {
      res.status(404).json({ success: false, error: 'ClientConfig non trovato' });
      return;
    }
    // Non esporre il segreto: la password di modifica prenotazioni non deve mai uscire dall'API.
    const { bookingUpdatePassword: _omit, ...safeConfig } = clientConfig;
    res.json({ success: true, data: safeConfig });
  });

  updateClientConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      clientName,
      clientLogoUrl,
      clientTimeZone,
      clientLocale,
      primaryColor,
      secondaryColor,
      features,
      maxUsers,
      maxBookings,
      maxAttachmentSizeMB,
      apiRateLimitPerMinute,
      bookingUpdatePassword,
      customFields,
    } = req.body;

    const updated = await this.configService.updateClientConfig({
      clientName,
      clientLogoUrl,
      clientTimeZone,
      clientLocale,
      primaryColor,
      secondaryColor,
      features: features as Record<string, boolean>,
      maxUsers,
      maxBookings,
      maxAttachmentSizeMB,
      apiRateLimitPerMinute,
      bookingUpdatePassword,
      customFields,
    });

    // Invalida cache feature flags
    clearFeatureCache();

    res.json({ success: true, message: 'ClientConfig aggiornato con successo', data: updated });
  });
}
