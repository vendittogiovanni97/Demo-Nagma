import prisma from '../../../core/shared/utils/prisma';
import { Cache } from '../../../core/shared/utils/cache';
import { config } from '../../../core/config/env';

export interface ClientFeatures {
  enableCream: boolean;
  enableWhatsApp: boolean;
  enableFormTemplate: boolean;
  enableConfig: boolean;
}

export class ConfigService {
  private cache = new Cache<string>(5 * 60 * 1000);
  private criticalConfig: Record<string, string> = {};

  async initializeConfig(seed: boolean = false): Promise<void> {
    const all = await prisma.config.findMany({ where: { deletedAt: null } });
    for (const cfg of all) {
      this.criticalConfig[cfg.paramsKey] = cfg.value;
      this.cache.set(cfg.paramsKey, cfg.value);
    }
    if (seed) await this.seedInitialConfig();
  }

  private async seedInitialConfig(): Promise<void> {
    const count = await prisma.config.count({ where: { deletedAt: null } });
    if (count > 0) return;

    const defaults = [
      { paramsKey: 'FILES_PATH', value: '/uploads/attachments/' },
      { paramsKey: 'DEBUG_HTTP', value: 'false' },
      { paramsKey: 'LOG_LEVEL', value: 'INFO' },
      { paramsKey: 'MAX_PAGE_LIMIT', value: '100' },
      { paramsKey: 'APP_VERSION', value: '1.0.0' },
      { paramsKey: 'SHOW_CONSENSI', value: 'false' },
      { paramsKey: 'SHOW_POSIZIONAMENTO', value: 'false' },
      { paramsKey: 'DEFAULT_PHONE_PREFIX', value: '+39' },
    ];

    for (const d of defaults) {
      await prisma.config.upsert({
        where: { paramsKey: d.paramsKey },
        update: { value: d.value },
        create: { paramsKey: d.paramsKey, value: d.value },
      });
    }
  }

  async getValue(key: string, defaultValue?: string): Promise<string> {
    const cached = this.cache.get(key);
    if (cached) return cached;

    const cfg = await prisma.config.findFirst({ where: { paramsKey: key, deletedAt: null } });
    const val = cfg?.value || defaultValue || '';
    this.cache.set(key, val);
    this.criticalConfig[key] = val;
    return val;
  }

  async setValue(key: string, value: string): Promise<void> {
    await prisma.config.upsert({
      where: { paramsKey: key },
      update: { value },
      create: { paramsKey: key, value },
    });
    this.cache.delete(key);
    if (this.criticalConfig[key] !== undefined) {
      this.criticalConfig[key] = value;
    }
  }

  async getAll(): Promise<any[]> {
    return prisma.config.findMany({ where: { deletedAt: null } });
  }

  getValueSync(key: string, defaultValue?: string): string {
    return this.criticalConfig[key] || defaultValue || '';
  }

  async getMaxPageLimit(): Promise<number> {
    return parseInt(await this.getValue('MAX_PAGE_LIMIT', '100'), 10);
  }

  getMaxPageLimitSync(): number {
    return parseInt(this.getValueSync('MAX_PAGE_LIMIT', '100'), 10);
  }

  async getAppVersion(): Promise<string> {
    return this.getValue('APP_VERSION', '1.0.0');
  }

  getAppVersionSync(): string {
    return this.getValueSync('APP_VERSION', '1.0.0');
  }

  async getBookingUpdatePassword(): Promise<string> {
    const clientConfig = await prisma.clientConfig.findFirst();
    return clientConfig?.bookingUpdatePassword || '';
  }

  async verifyBookingUpdatePassword(plainPassword: string): Promise<boolean> {
    const clientConfig = await prisma.clientConfig.findFirst();
    const stored = clientConfig?.bookingUpdatePassword;
    if (!stored) return false;

    const bcryptjs = require('bcryptjs');
    if (!stored.startsWith('$2b$')) {
      const salt = config.bcryptSaltRounds;
      const hashed = await bcryptjs.hash(stored, salt);
      await prisma.clientConfig.update({
        where: { id: clientConfig!.id },
        data: { bookingUpdatePassword: hashed },
      });
      return await bcryptjs.compare(plainPassword, hashed);
    }
    return await bcryptjs.compare(plainPassword, stored);
  }

  async getShowConsensi(): Promise<boolean> {
    return (await this.getValue('SHOW_CONSENSI', 'false')) === 'true';
  }

  getShowConsensiSync(): boolean {
    return this.getValueSync('SHOW_CONSENSI', 'false') === 'true';
  }

  async getShowPosizionamento(): Promise<boolean> {
    return (await this.getValue('SHOW_POSIZIONAMENTO', 'false')) === 'true';
  }

  getShowPosizionamentoSync(): boolean {
    return this.getValueSync('SHOW_POSIZIONAMENTO', 'false') === 'true';
  }

  async getDefaultPhonePrefix(): Promise<string> {
    return this.getValue('DEFAULT_PHONE_PREFIX', '+39');
  }

  getDefaultPhonePrefixSync(): string {
    return this.getValueSync('DEFAULT_PHONE_PREFIX', '+39');
  }

  // Nuovo: features da ClientConfig
  async getFeatures(): Promise<ClientFeatures> {
    const clientConfig = await prisma.clientConfig.findFirst();
    if (!clientConfig || !clientConfig.features) {
      return {
        enableCream: true,
        enableWhatsApp: true,
        enableFormTemplate: true,
        enableConfig: true,
      };
    }
    const features = clientConfig.features as Record<string, boolean>;
    return {
      enableCream: features.enableCream ?? true,
      enableWhatsApp: features.enableWhatsApp ?? true,
      enableFormTemplate: features.enableFormTemplate ?? true,
      enableConfig: features.enableConfig ?? true,
    };
  }

  // Nuovo: intera ClientConfig
  async getClientConfig() {
    return prisma.clientConfig.findFirst();
  }

  async updateClientConfig(data: Partial<{
    clientName: string;
    clientLogoUrl: string;
    clientTimeZone: string;
    clientLocale: string;
    primaryColor: string;
    secondaryColor: string;
    features: Record<string, boolean>;
    maxUsers: number;
    maxBookings: number;
    maxAttachmentSizeMB: number;
    apiRateLimitPerMinute: number;
    bookingUpdatePassword: string;
    customFields: Record<string, any>;
  }>) {
    const existing = await prisma.clientConfig.findFirst();
    if (!existing) {
      return prisma.clientConfig.create({ data: data as any });
    }
    return prisma.clientConfig.update({
      where: { id: existing.id },
      data,
    });
  }
}
