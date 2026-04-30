import bcryptjs from 'bcryptjs';
import { Cache } from '../utils/cache';
import { logger } from '../utils/logger';
import prisma from '../utils/prisma';

const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minuti
const configCache = new Cache<string>(CONFIG_CACHE_TTL);

const criticalConfig: Record<string, string> = {};

const HASH_PREFIX = '$2b$';

async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  try {
    return await bcryptjs.hash(password, saltRounds);
  } catch (error) {
    logger.errorWithStack('Errore hashing password', error);
    throw error;
  }
}

async function isPasswordHashed(value: string): Promise<boolean> {
  return value.startsWith(HASH_PREFIX);
}

interface ConfigValue {
  paramsKey: string;
  value: string;
}

/**
 * Inizializza i config critici dal DB al boot del server
 * Deve essere chiamato in index.ts::startServer()
 */
async function initializeConfig(seed: boolean = false): Promise<void> {
  try {
    const allConfigs = await prisma.config.findMany();

    for (const cfg of allConfigs) {
      criticalConfig[cfg.paramsKey] = cfg.value;
      configCache.set(cfg.paramsKey, cfg.value);
    }

    logger.info(`✅ Config inizializzato (${allConfigs.length} parametri caricati)`);
    // Seed opzionale after inizializzazione
    if (seed) {
      await seedInitialConfig();
    }
  } catch (error) {
    logger.warn('⚠️ Errore inizializzazione config', { error });
  }
}

/**
 * Seed iniziale della tabella Config (solo se vuota)
 */
async function seedInitialConfig(): Promise<void> {
  try {
    const count = await prisma.config.count();
    if (count > 0) {
      logger.info('ℹ️ Seed config skipped: config table already populated');
      return;
    }

    const defaults = [
      { paramsKey: 'FILES_PATH', value: '/uploads/attachments/' },
      { paramsKey: 'DEBUG_HTTP', value: 'false' },
      { paramsKey: 'LOG_LEVEL', value: 'INFO' },
      { paramsKey: 'JWT_EXPIRY', value: '8h' },
      { paramsKey: 'BCRYPT_SALT_ROUNDS', value: '10' },
      { paramsKey: 'LOGIN_RATE_LIMIT_WINDOW_MINUTES', value: '15' },
      { paramsKey: 'LOGIN_RATE_LIMIT_MAX_ATTEMPTS', value: '5' },
      { paramsKey: 'SESSION_TIMEOUT_MINUTES', value: '30' },
      { paramsKey: 'MAX_PAGE_LIMIT', value: '100' },
      { paramsKey: 'APP_VERSION', value: '1.0.0' },
      { paramsKey: 'BOOKING_UPDATE_PASSWORD', value: '' },
    ];

    for (const d of defaults) {
      // Crear una riga singola per ogni entry (compat con versioni di Prisma se createMany non disponibile)
      await prisma.config.create({ data: d });
    }
    logger.info(`✅ Seed completo (${defaults.length} righe inserite in config)`);
  } catch (error) {
    logger.errorWithStack('❌ Errore seed config', error);
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
    logger.warn(`⚠️ Errore lettura config "${paramsKey}"`, { error });
    return defaultValue || '';
  }
}

/**
 * Scrivi valore a config
 * Nota: Se paramsKey è BOOKING_UPDATE_PASSWORD, il valore viene automaticamente hashed
 */
async function setConfigValue(paramsKey: string, value: string): Promise<void> {
  try {
    let finalValue = value;

    // Hash password per booking update
    if (paramsKey === 'BOOKING_UPDATE_PASSWORD' && value && !value.startsWith(HASH_PREFIX)) {
      const saltRounds = await getBcryptSaltRounds();
      finalValue = await hashPassword(value, saltRounds);
      logger.info(`🔐 Password per booking update hashed (${paramsKey})`);
    }

    await prisma.config.upsert({
      where: { paramsKey },
      update: { value: finalValue },
      create: { paramsKey, value: finalValue },
    });

    // Invalidate cache
    configCache.delete(paramsKey);
    logger.info(`✅ Config "${paramsKey}" aggiornato`);
  } catch (error) {
    logger.errorWithStack(`❌ Errore scrittura config "${paramsKey}"`, error);
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
    logger.errorWithStack('❌ Errore lettura config', error);
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
 * Ritorna la password hashed (mai il plain text)
 */
async function getBookingUpdatePassword(): Promise<string> {
  return getConfigValue('BOOKING_UPDATE_PASSWORD', '');
}

/**
 * Verifica una password contro il booking update password hash
 * Supporta transizione da plain text a hashed (backward compatibility)
 */
async function verifyBookingUpdatePassword(plainPassword: string): Promise<boolean> {
  const storedPassword = await getBookingUpdatePassword();

  if (!storedPassword) {
    return false;
  }

  // Se il valore non è hashed, fai migrazione al primo check
  if (!storedPassword.startsWith(HASH_PREFIX)) {
    logger.warn('⚠️ Password booking update è in plain text. Migrazione in corso...');
    const saltRounds = await getBcryptSaltRounds();
    const hashed = await hashPassword(storedPassword, saltRounds);
    await setConfigValue('BOOKING_UPDATE_PASSWORD', hashed);
    // Compara contro il nuovo hash
    return await bcryptjs.compare(plainPassword, hashed);
  }

  // Compara contro hash existente
  return await bcryptjs.compare(plainPassword, storedPassword);
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
  verifyBookingUpdatePassword,
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
