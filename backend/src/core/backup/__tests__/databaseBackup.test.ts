import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import { spawn } from 'child_process';

import { config } from '../../config/env';
import { DatabaseBackupScheduler } from '../databaseBackup';

jest.mock('child_process', () => {
  const original = jest.requireActual('child_process');
  return {
    ...original,
    spawn: jest.fn(),
  };
});

const mockedSpawn = jest.mocked(spawn);

/** Shape minima del ChildProcess mockato: stdout/stderr sono Duplex (PassThrough),
 *  con emit per simulare gli eventi 'close'/'error'. */
interface MockChildProcess {
  stdout: PassThrough;
  stderr: PassThrough;
  emit(event: string, ...args: unknown[]): boolean;
}

const mockChild = (): MockChildProcess => {
  const child = new EventEmitter() as unknown as MockChildProcess;
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  return child;
};

describe('DatabaseBackupScheduler Unit Tests (Without Postgres)', () => {
  const testBackupDir = path.resolve('./backups/test_backup_dir');

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
    (config as { databaseBackupPath: string }).databaseBackupPath = testBackupDir;
    (config as { databaseBackupRetention: number }).databaseBackupRetention = 7;
    await fs.mkdir(testBackupDir, { recursive: true }).catch(() => {});
  });

  afterEach(async () => {
    await fs.rm(testBackupDir, { recursive: true, force: true }).catch(() => {});
  });

  it('dovrebbe individuare pg_dump nativo ed eseguire il backup senza errori', async () => {
    mockedSpawn.mockImplementation((command: string, args: readonly string[]) => {
      const child = mockChild();

      setTimeout(() => {
        if (args.includes('--version')) {
          child.emit('close', 0);
        } else {
          child.stdout.write('MOCK PG DUMP DATA');
          child.stdout.end();
          child.emit('close', 0);
        }
      }, 10);

      return child as unknown as ReturnType<typeof spawn>;
    });

    const scheduler = new DatabaseBackupScheduler();
    const backupFile = await scheduler.run();

    expect(backupFile).not.toBeNull();
    expect(backupFile).toContain('nagma-db-');
    expect(backupFile).toContain('.dump');

    const exists = await fs
      .access(backupFile!)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    const fileContent = await fs.readFile(backupFile!, 'utf-8');
    expect(fileContent).toBe('MOCK PG DUMP DATA');
  });

  it('dovrebbe gestire la retention rimuovendo i file di backup vecchi', async () => {
    for (let i = 1; i <= 10; i++) {
      const fakeName = `nagma-db-2026-01-0${i < 10 ? `0${i}` : i}T00-00-00Z.dump`;
      await fs.writeFile(path.join(testBackupDir, fakeName), 'fake content');
    }

    mockedSpawn.mockImplementation((command: string, args: readonly string[]) => {
      const child = mockChild();

      setTimeout(() => {
        if (args.includes('--version')) {
          child.emit('close', 0);
        } else {
          child.stdout.write('NEW DUMP DATA');
          child.stdout.end();
          child.emit('close', 0);
        }
      }, 20);

      return child as unknown as ReturnType<typeof spawn>;
    });

    const scheduler = new DatabaseBackupScheduler();
    await scheduler.run();

    const remainingFiles = await fs.readdir(testBackupDir);
    expect(remainingFiles.length).toBeLessThanOrEqual(7);
  });

  it('dovrebbe gestire con grazia l assenza sia di pg_dump che di docker', async () => {
    mockedSpawn.mockImplementation(() => {
      const child = mockChild();

      setTimeout(() => {
        child.emit('error', new Error('ENOENT: command not found'));
      }, 10);

      return child as unknown as ReturnType<typeof spawn>;
    });

    const scheduler = new DatabaseBackupScheduler();
    const backupFile = await scheduler.run();

    expect(backupFile).toBeNull();
  });
});
