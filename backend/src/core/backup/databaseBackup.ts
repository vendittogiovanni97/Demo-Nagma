import { spawn } from 'child_process';
import { createWriteStream, promises as fs } from 'fs';
import path from 'path';

import { config } from '../config/env';
import { logger } from '../shared/utils/logger';

const BACKUP_FILE_PREFIX = 'nagma-db-';
const BACKUP_FILE_EXTENSION = '.dump';

interface DatabaseConnection {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

function getDatabaseConnection(): DatabaseConnection {
  const databaseUrl = new URL(process.env.DATABASE_URL!);
  return {
    host: databaseUrl.hostname,
    port: databaseUrl.port || '5432',
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: decodeURIComponent(databaseUrl.pathname.replace(/^\//, '')),
  };
}

function timestampForFilename(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/:/g, '-');
}

async function commandExists(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'ignore' });
    child.once('error', () => resolve(false));
    child.once('close', (code) => resolve(code === 0));
  });
}

async function writeCommandOutput(
  command: string,
  args: string[],
  destination: string,
  env: NodeJS.ProcessEnv,
): Promise<void> {
  const output = createWriteStream(destination, { flags: 'wx' });
  const child = spawn(command, args, {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';

  child.stdout.pipe(output);
  child.stderr.on('data', (chunk: Buffer) => {
    if (stderr.length < 4_000) stderr += chunk.toString();
  });

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        reject(new Error(`Backup PostgreSQL fallito (exit ${code}): ${stderr.trim()}`));
      });
    }),
    new Promise<void>((resolve, reject) => {
      output.once('finish', resolve);
      output.once('error', reject);
    }),
  ]);
}

export class DatabaseBackupScheduler {
  private initialTimer: NodeJS.Timeout | null = null;
  private hasBeenScheduled = false;
  private isRunning = false;

  start(): void {
    if (!config.databaseBackupEnabled || this.hasBeenScheduled) return;
    this.hasBeenScheduled = true;

    logger.info('Backup database singolo pianificato', {
      delayMinutes: config.databaseBackupDelayMinutes,
      retention: config.databaseBackupRetention,
      path: config.databaseBackupPath,
    });

    this.initialTimer = setTimeout(() => {
      this.initialTimer = null;
      void this.run();
    }, config.databaseBackupDelayMinutes * 60_000);
    this.initialTimer.unref();
  }

  stop(): void {
    if (this.initialTimer) clearTimeout(this.initialTimer);
    this.initialTimer = null;
  }

  async run(): Promise<string | null> {
    if (this.isRunning) {
      logger.warn('Backup database saltato: operazione precedente ancora in corso');
      return null;
    }

    this.isRunning = true;
    const backupDirectory = path.resolve(config.databaseBackupPath);
    const backupPath = path.join(
      backupDirectory,
      `${BACKUP_FILE_PREFIX}${timestampForFilename(new Date())}${BACKUP_FILE_EXTENSION}`,
    );

    try {
      await fs.mkdir(backupDirectory, { recursive: true });
      await this.createBackup(backupPath);
      await this.enforceRetention(backupDirectory);
      const stats = await fs.stat(backupPath);
      logger.info('Backup database completato', {
        file: backupPath,
        sizeBytes: stats.size,
      });
      return backupPath;
    } catch (error) {
      await fs.rm(backupPath, { force: true }).catch(() => undefined);
      logger.errorWithStack('Backup database fallito', error, { file: backupPath });
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  private async findNativePgDump(): Promise<string | null> {
    const candidates = [
      config.databaseBackupPgDumpPath,
      'pg_dump',
      'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
      'C:\\PostgreSQL\\18\\bin\\pg_dump.exe',
      'C:\\PostgreSQL\\17\\bin\\pg_dump.exe',
      'C:\\PostgreSQL\\16\\bin\\pg_dump.exe',
      '/Library/PostgreSQL/18/bin/pg_dump',
      '/Library/PostgreSQL/17/bin/pg_dump',
      '/Library/PostgreSQL/16/bin/pg_dump',
      '/opt/homebrew/bin/pg_dump',
      '/usr/local/bin/pg_dump',
      '/usr/bin/pg_dump',
    ];

    for (const candidate of candidates) {
      if (candidate && (await commandExists(candidate, ['--version']))) {
        return candidate;
      }
    }
    return null;
  }

  private async createBackup(destination: string): Promise<void> {
    const connection = getDatabaseConnection();
    const pgDumpArgs = [
      '--format=custom',
      '--no-owner',
      '--no-privileges',
      '--host',
      connection.host,
      '--port',
      connection.port,
      '--username',
      connection.user,
      connection.database,
    ];
    const processEnv = { ...process.env, PGPASSWORD: connection.password };

    const nativePgDump = await this.findNativePgDump();
    if (nativePgDump) {
      await writeCommandOutput(nativePgDump, pgDumpArgs, destination, processEnv);
      return;
    }

    if (await commandExists('docker', ['--version'])) {
      const containerName = config.databaseBackupDockerContainer || 'nagma-postgres';
      const dockerArgs = [
        'exec',
        '--env',
        'PGPASSWORD',
        containerName,
        'pg_dump',
        '--format=custom',
        '--no-owner',
        '--no-privileges',
        '--username',
        connection.user,
        connection.database,
      ];
      try {
        await writeCommandOutput('docker', dockerArgs, destination, processEnv);
        return;
      } catch (dockerErr) {
        logger.warn('Tentativo backup via Docker fallito, verificare che il container sia attivo', {
          container: containerName,
          error: String(dockerErr),
        });
      }
    }

    throw new Error(
      'Nessun eseguibile pg_dump nativo o container Docker funzionante trovato. Installare PostgreSQL 18 o assicurarsi che pg_dump sia nel PATH.'
    );
  }

  private async enforceRetention(backupDirectory: string): Promise<void> {
    const entries = await fs.readdir(backupDirectory, { withFileTypes: true });
    const backupFiles = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.startsWith(BACKUP_FILE_PREFIX) &&
          entry.name.endsWith(BACKUP_FILE_EXTENSION),
      )
      .map((entry) => entry.name)
      .sort()
      .reverse();

    const expiredFiles = backupFiles.slice(config.databaseBackupRetention);
    await Promise.all(
      expiredFiles.map((filename) =>
        fs.unlink(path.join(backupDirectory, filename)),
      ),
    );

    if (expiredFiles.length > 0) {
      logger.info('Vecchi backup database rimossi', { count: expiredFiles.length });
    }
  }
}

export const databaseBackupScheduler = new DatabaseBackupScheduler();
