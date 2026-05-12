import { IConfigRepository } from '../contracts/IConfigRepository';
import { Config } from '../domain/Config';
import { Cache } from '../../../shared/utils/cache';
import { config } from '../../../config/env';

export class ConfigService {
  private cache = new Cache<string>(5 * 60 * 1000);
  private criticalConfig: Record<string, string> = {};

  constructor(private configRepository: IConfigRepository) {}

  async initializeConfig(seed: boolean = false): Promise<void> {
    const all = await this.configRepository.findAll();
    for (const cfg of all) {
      const data = cfg.toJSON();
      this.criticalConfig[data.paramsKey] = data.value;
      this.cache.set(data.paramsKey, data.value);
    }
    if (seed) await this.seedInitialConfig();
  }

  private async seedInitialConfig(): Promise<void> {
    const count = await this.configRepository.count();
    if (count > 0) return;

    const defaults = [
      { paramsKey: 'FILES_PATH', value: '/uploads/attachments/' },
      { paramsKey: 'DEBUG_HTTP', value: 'false' },
      { paramsKey: 'LOG_LEVEL', value: 'INFO' },
      { paramsKey: 'MAX_PAGE_LIMIT', value: '100' },
      { paramsKey: 'APP_VERSION', value: '1.0.0' },
      { paramsKey: 'BOOKING_UPDATE_PASSWORD', value: '' },
      { paramsKey: 'SHOW_CONSENSI', value: 'false' },
      { paramsKey: 'SHOW_POSIZIONAMENTO', value: 'false' },
    ];

    for (const d of defaults) {
      await this.configRepository.save(new Config(d));
    }
  }

  async getValue(key: string, defaultValue?: string): Promise<string> {
    const cached = this.cache.get(key);
    if (cached) return cached;

    const cfg = await this.configRepository.findByKey(key);
    const val = cfg?.value || defaultValue || '';
    this.cache.set(key, val);
    this.criticalConfig[key] = val;
    return val;
  }

  async setValue(key: string, value: string): Promise<void> {
    await this.configRepository.save(new Config({ paramsKey: key, value }));
    this.cache.delete(key);
    // Update critical config if it was already there
    if (this.criticalConfig[key] !== undefined) {
      this.criticalConfig[key] = value;
    }
  }

  async getAll(): Promise<Config[]> {
    return this.configRepository.findAll();
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

  async getAppVersion(): Promise<string> { return this.getValue('APP_VERSION', '1.0.0'); }
  getAppVersionSync(): string { return this.getValueSync('APP_VERSION', '1.0.0'); }

  async getBookingUpdatePassword(): Promise<string> { return this.getValue('BOOKING_UPDATE_PASSWORD', ''); }

  async verifyBookingUpdatePassword(plainPassword: string): Promise<boolean> {
    const stored = await this.getBookingUpdatePassword();
    if (!stored) return false;
    
    const bcryptjs = require('bcryptjs');
    if (!stored.startsWith('$2b$')) {
      // Auto-migration
      const salt = config.bcryptSaltRounds;
      const hashed = await bcryptjs.hash(stored, salt);
      await this.setValue('BOOKING_UPDATE_PASSWORD', hashed);
      return await bcryptjs.compare(plainPassword, hashed);
    }
    return await bcryptjs.compare(plainPassword, stored);
  }

  async getShowConsensi(): Promise<boolean> {
    const val = await this.getValue('SHOW_CONSENSI', 'false');
    return val === 'true';
  }

  getShowConsensiSync(): boolean {
    const val = this.getValueSync('SHOW_CONSENSI', 'false');
    return val === 'true';
  }

  async getShowPosizionamento(): Promise<boolean> {
    const val = await this.getValue('SHOW_POSIZIONAMENTO', 'false');
    return val === 'true';
  }

  getShowPosizionamentoSync(): boolean {
    const val = this.getValueSync('SHOW_POSIZIONAMENTO', 'false');
    return val === 'true';
  }
}
