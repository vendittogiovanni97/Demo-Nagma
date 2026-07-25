import { databaseBackupScheduler } from './databaseBackup';

async function main(): Promise<void> {
  const backupFile = await databaseBackupScheduler.run();

  if (!backupFile) {
    process.exitCode = 1;
    return;
  }

  console.log(`\nBackup salvato in:\n${backupFile}`);
}

void main();
