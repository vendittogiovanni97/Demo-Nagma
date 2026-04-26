import { prisma } from '@/lib/prisma';
import { Cache } from '@/utils/cache';

/**
 * ConfigService - Gestisce i parametri di configurazione dalla tabella Config
 * Con caching per performance
 *
 * IMPORTANTE: Deve essere inizializzato all'avvio del server con initializeConfig()
 */

const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minuti
const configCache = new Cache<string>(CONFIG_CACHE_TTL);

// In-memory store per valori critici (letti una sola volta al boot)
const criticalConfig: Record<string, string> = {};

interface ConfigValue {
  paramsKey: string;
  value: string;
}

/**
 * Inizializza i config critici dal DB al boot del server
 * Deve essere chiamato in index.ts::startServer()
 */
async function initializeConfig(): Promise<void> {
  try {
    const allConfigs = await prisma.config.findMany();

    for (const cfg of allConfigs) {
      criticalConfig[cfg.paramsKey] = cfg.value;
      configCache.set(cfg.paramsKey, cfg.value);
    }

    console.log(`✅ Config inizializzato (${allConfigs.length} parametri caricati)`);
  } catch (error) {
    console.warn('⚠️ Errore inizializzazione config:', error);
  }
}

/**
 * Leggi valore da config (con fallback a .env)
 */
async function getConfigValue(paramsKey: string, defaultValue?: string): Promise<string> {
  // Check critical config first (set at boot)
  if (criticalConfig[paramsKey]) {
    return criticalConfig[paramsKey];
  }

  // Check cache
  const cached = configCache.get(paramsKey);
  if (cached) {
    return cached;
  }

  try {
    const config = await prisma.config.findUnique({
      where: { paramsKey },
    });

    const value = config?.value || defaultValue || '';

    // Store in cache
    configCache.set(paramsKey, value);

    return value;
  } catch (error) {
    console.warn(`⚠️ Errore lettura config "${paramsKey}":`, error);
    return defaultValue || '';
  }
}

/**
 * Scrivi valore a config
 */
async function setConfigValue(paramsKey: string, value: string): Promise<void> {
  try {
    await prisma.config.upsert({
      where: { paramsKey },
      update: { value },
      create: { paramsKey, value },
    });

    // Invalidate cache
    configCache.delete(paramsKey);
    console.log(`✅ Config "${paramsKey}" aggiornato`);
  } catch (error) {
    console.error(`❌ Errore scrittura config "${paramsKey}":`, error);
    throw error;
  }
}

/**
 * Leggi tutti i config values
 */
async function getAllConfig(): Promise<ConfigValue[]> {
  try {
    return await prisma.config.findMany();
  } catch (error) {
    console.error('❌ Errore lettura config:', error);
    return [];
  }
}

/**
 * Pulisci cache
 */
function invalidateCache(paramsKey?: string): void {
  if (paramsKey) {
    configCache.delete(paramsKey);
  } else {
    configCache.clear();
  }
}

// ============================================
// SPECIFIC CONFIG GETTERS (Type-safe)
// ============================================

/**
 * FILES_PATH - Cartella per upload allegati
 */
async function getFilesPath(): Promise<string> {
  return getConfigValue('FILES_PATH', '/uploads/attachments/');
}

/**
 * DEBUG_HTTP - Enable debug HTTP logging
 */
async function getDebugHttp(): Promise<boolean> {
  const value = await getConfigValue('DEBUG_HTTP', 'false');
  return value === 'true';
}

/**
 * LOG_LEVEL - Livello di logging (DEBUG, INFO, WARN, ERROR)
 */
async function getLogLevel(): Promise<string> {
  return getConfigValue('LOG_LEVEL', 'INFO');
}

/**
 * JWT_EXPIRY - Durata token JWT (es: "8h", "24h", "7d")
 */
async function getJwtExpiry(): Promise<string> {
  return getConfigValue('JWT_EXPIRY', '8h');
}

/**
 * BCRYPT_SALT_ROUNDS - Numero round bcrypt per password hashing
 */
async function getBcryptSaltRounds(): Promise<number> {
  const value = await getConfigValue('BCRYPT_SALT_ROUNDS', '10');
  return parseInt(value, 10);
}

/**
 * LOGIN_RATE_LIMIT_WINDOW_MINUTES - Finestra temporale per rate limit login
 */
async function getLoginRateLimitWindowMinutes(): Promise<number> {
  const value = await getConfigValue('LOGIN_RATE_LIMIT_WINDOW_MINUTES', '15');
  return parseInt(value, 10);
}

/**
 * LOGIN_RATE_LIMIT_MAX_ATTEMPTS - Tentativi massimi prima blocco
 */
async function getLoginRateLimitMaxAttempts(): Promise<number> {
  const value = await getConfigValue('LOGIN_RATE_LIMIT_MAX_ATTEMPTS', '5');
  return parseInt(value, 10);
}

/**
 * SESSION_TIMEOUT_MINUTES - Timeout sessione in minuti
 */
async function getSessionTimeoutMinutes(): Promise<number> {
  const value = await getConfigValue('SESSION_TIMEOUT_MINUTES', '30');
  return parseInt(value, 10);
}

/**
 * MAX_PAGE_LIMIT - Limite massimo items per pagina
 */
async function getMaxPageLimit(): Promise<number> {
  const value = await getConfigValue('MAX_PAGE_LIMIT', '100');
  return parseInt(value, 10);
}

/**
 * APP_VERSION - Versione applicazione
 */
async function getAppVersion(): Promise<string> {
  return getConfigValue('APP_VERSION', '1.0.0');
}

/**
 * BOOKING_UPDATE_PASSWORD - Password per modificare prenotazioni
 * IMPORTANTE: Deve essere impostata nel database, non ha default nel codice
 */
async function getBookingUpdatePassword(): Promise<string> {
  return getConfigValue('BOOKING_UPDATE_PASSWORD', '');
}

// ============================================
// SYNCHRONOUS GETTERS (post-init)
// ============================================

/**
 * Leggi valore sincronamente (disponibile DOPO initializeConfig())
 * Usa il critical config cache
 */
function getConfigValueSync(paramsKey: string, defaultValue?: string): string {
  return criticalConfig[paramsKey] || defaultValue || '';
}

/**
 * DEBUG_HTTP - Sync getter (per startup logging)
 */
function getDebugHttpSync(): boolean {
  return getConfigValueSync('DEBUG_HTTP', 'false') === 'true';
}

/**
 * LOG_LEVEL - Sync getter
 */
function getLogLevelSync(): string {
  return getConfigValueSync('LOG_LEVEL', 'INFO');
}

/**
 * JWT_EXPIRY - Sync getter
 */
function getJwtExpirySync(): string {
  return getConfigValueSync('JWT_EXPIRY', '8h');
}

/**
 * BCRYPT_SALT_ROUNDS - Sync getter
 */
function getBcryptSaltRoundsSync(): number {
  return parseInt(getConfigValueSync('BCRYPT_SALT_ROUNDS', '10'), 10);
}

/**
 * LOGIN_RATE_LIMIT_WINDOW_MINUTES - Sync getter
 */
function getLoginRateLimitWindowMinutesSync(): number {
  return parseInt(getConfigValueSync('LOGIN_RATE_LIMIT_WINDOW_MINUTES', '15'), 10);
}

/**
 * LOGIN_RATE_LIMIT_MAX_ATTEMPTS - Sync getter
 */
function getLoginRateLimitMaxAttemptsSync(): number {
  return parseInt(getConfigValueSync('LOGIN_RATE_LIMIT_MAX_ATTEMPTS', '5'), 10);
}

/**
 * SESSION_TIMEOUT_MINUTES - Sync getter
 */
function getSessionTimeoutMinutesSync(): number {
  return parseInt(getConfigValueSync('SESSION_TIMEOUT_MINUTES', '30'), 10);
}

/**
 * MAX_PAGE_LIMIT - Sync getter
 */
function getMaxPageLimitSync(): number {
  return parseInt(getConfigValueSync('MAX_PAGE_LIMIT', '100'), 10);
}

/**
 * APP_VERSION - Sync getter
 */
function getAppVersionSync(): string {
  return getConfigValueSync('APP_VERSION', '1.0.0');
}

/**
 * BOOKING_UPDATE_PASSWORD - Sync getter
 * IMPORTANTE: Deve essere impostata nel database, non ha default nel codice
 */
function getBookingUpdatePasswordSync(): string {
  return getConfigValueSync('BOOKING_UPDATE_PASSWORD', '');
}

export const configService = {
  // Initialization
  initializeConfig,
  // Async getters
  getConfigValue,
  setConfigValue,
  getAllConfig,
  invalidateCache,
  // Specific async getters
  getFilesPath,
  getDebugHttp,
  getLogLevel,
  getJwtExpiry,
  getBcryptSaltRounds,
  getLoginRateLimitWindowMinutes,
  getLoginRateLimitMaxAttempts,
  getSessionTimeoutMinutes,
  getMaxPageLimit,
  getAppVersion,
  getBookingUpdatePassword,
  // Sync getters (post-init)
  getConfigValueSync,
  getDebugHttpSync,
  getLogLevelSync,
  getJwtExpirySync,
  getBcryptSaltRoundsSync,
  getLoginRateLimitWindowMinutesSync,
  getLoginRateLimitMaxAttemptsSync,
  getSessionTimeoutMinutesSync,
  getMaxPageLimitSync,
  getAppVersionSync,
  getBookingUpdatePasswordSync,
};
