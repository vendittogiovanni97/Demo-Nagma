import { databaseBackupScheduler } from './databaseBackup';
import { logger } from '../shared/utils/logger';

async function main(): Promise<void> {
  const backupFile = await databaseBackupScheduler.run();

  if (!backupFile) {
    process.exitCode = 1;
    return;
  }

  logger.info(`Backup salvato in: ${backupFile}`);
}

void main();
