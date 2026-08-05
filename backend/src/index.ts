import 'dotenv/config';

import type { Server } from 'http';
import prisma, { closeDatabase } from './core/shared/utils/prisma';
import { createApp } from './app';
import { config } from './core/config/env';
import { isDebugHttpEnabled, logger } from './core/shared/utils/logger';
import { container } from './core/container';
import { ConfigService } from './modules/config/services/configService';
import { databaseBackupScheduler } from './core/backup/databaseBackup';
const configService = container.get(ConfigService);

const RESTART_DELAY_MS = config.restartDelayMs;
const port = Number(process.env.PORT || 3001);

let server: Server | null = null;
let restartTimer: NodeJS.Timeout | null = null;
let isRestarting = false;
let isShuttingDown = false;

function validateEnv() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET non configurato. Aggiungilo al file .env');
  }
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET troppo corto (minimo 32 caratteri richiesti per HS256)');
  }
  if (/change-this|your-super-secret|placeholder|example/i.test(jwtSecret)) {
    logger.warn('⚠️  ATTENZIONE: JWT_SECRET sembra un placeholder. Cambialo prima della produzione.');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL non configurato. Aggiungilo al file .env');
  }
}

async function stopServer() {
  databaseBackupScheduler.stop();

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    server = null;
    logger.info('HTTP server chiuso correttamente');
  }

  await closeDatabase();
  logger.info('Connessione Prisma chiusa');
}

async function startServer() {
  validateEnv();

  const app = createApp();

  await prisma.$connect();
  logger.info('Connessione Prisma aperta');


  // Inizializza config dalla tabella Config in base ai flag di env
  const initFromDb = (process.env.INIT_CONFIG_FROM_DB ?? 'false').toLowerCase() === 'true';
  const seedFlag = (process.env.INIT_CONFIG_SEED ?? 'false').toLowerCase() === 'true';
  if (initFromDb) {
    await configService.initializeConfig(seedFlag);
  } else {
    logger.info('INIT_CONFIG_FROM_DB=false; skip init config from DB');
  }

  await new Promise<void>((resolve, reject) => {
    const nextServer = app.listen(port, () => {
      server = nextServer;
      logger.info('Server avviato', {
        port,
        env: process.env.NODE_ENV || 'development',
        debugHttp: isDebugHttpEnabled(),
      });
      databaseBackupScheduler.start();
      resolve();
    });

    nextServer.on('error', reject);
  });
}

async function scheduleRestart(reason: string, error?: unknown) {
  if (isShuttingDown || isRestarting) return;

  isRestarting = true;
  logger.error('Crash rilevato, preparo riavvio controllato', { reason });
  if (error) {
    logger.errorWithStack('Dettaglio crash', error, { reason });
  }

  try {
    await stopServer();
  } catch (shutdownError) {
    logger.errorWithStack('Errore durante lo stop prima del riavvio', shutdownError);
  }

  const FAST_RESTART_DELAY_MS = 1000;
  logger.warn('Riavvio immediato pianificato (1s)', {
    delaySeconds: FAST_RESTART_DELAY_MS / 1000,
    reason,
  });

  restartTimer = setTimeout(() => {
    restartTimer = null;
    isRestarting = false;

    logger.info('Tentativo di riavvio automatico in corso');
    void boot();
  }, FAST_RESTART_DELAY_MS);
}

async function shutdown(signal: string) {
  if (isShuttingDown) return;

  isShuttingDown = true;
  logger.warn('Segnale di arresto ricevuto', { signal });

  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  try {
    await stopServer();
    logger.info('Arresto completato');
    process.exit(0);
  } catch (error) {
    logger.errorWithStack('Errore durante l\'arresto del server', error, { signal });
    process.exit(1);
  }
}

async function boot() {
  try {
    logger.info('Avvio backend in corso');
    await startServer();
  } catch (error) {
    await scheduleRestart('errore durante l\'avvio', error);
  }
}

process.on('uncaughtException', (error) => {
  logger.errorWithStack('uncaughtException intercettata', error);
  void scheduleRestart('uncaughtException', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection intercettata (il server rimane attivo)', { reason });
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void boot();
