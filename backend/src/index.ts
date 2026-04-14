import dotenv from 'dotenv';
import type { Server } from 'http';

import prisma from './utils/prisma';
import { createApp } from './app';
import { config } from './config/env';
import { isDebugHttpEnabled, logger } from './utils/logger';

dotenv.config();

const RESTART_DELAY_MS = config.restartDelayMs;
const port = Number(process.env.PORT || 3001);

let server: Server | null = null;
let restartTimer: NodeJS.Timeout | null = null;
let isRestarting = false;
let isShuttingDown = false;

function validateEnv() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET non configurato. Aggiungilo al file .env');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL non configurato. Aggiungilo al file .env');
  }
}

async function stopServer() {
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

  await prisma.$disconnect();
  logger.info('Connessione Prisma chiusa');
}

async function startServer() {
  validateEnv();

  const app = createApp();

  await prisma.$connect();
  logger.info('Connessione Prisma aperta');

  await new Promise<void>((resolve, reject) => {
    const nextServer = app.listen(port, () => {
      server = nextServer;
      logger.info('Server avviato', {
        port,
        env: process.env.NODE_ENV || 'development',
        debugHttp: isDebugHttpEnabled(),
      });
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

  logger.warn('Riavvio pianificato', {
    delaySeconds: RESTART_DELAY_MS / 1000,
    reason,
  });

  restartTimer = setTimeout(() => {
    restartTimer = null;
    isRestarting = false;

    logger.info('Tentativo di riavvio automatico in corso');
    void boot();
  }, RESTART_DELAY_MS);
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
  logger.error('unhandledRejection intercettata', { reason });
  void scheduleRestart('unhandledRejection', reason);
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void boot();
