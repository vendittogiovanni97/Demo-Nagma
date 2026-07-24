import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { logger } from './logger';

export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5433/nagmadb?schema=public';

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, errorFormat: 'pretty' });

// FIX B6: Monitor slow queries at Prisma level
// Note: Query event monitoring in PrismaClient requires proper typing
// For production use, consider enabling query logging via LOG env var:
// DATABASE_LOG=query,info LOG_QUERIES=true
if (process.env.LOG_QUERIES === 'true') {
  // @ts-ignore - Prisma query event typing limitation
  prisma.$on('query', (e: any) => {
    const durationMs = e.duration;

    if (durationMs > 5000) {
      logger.error('⚠️ Very slow database query detected (>5s)', {
        query: e.query?.substring(0, 200) || 'unknown',
        duration: durationMs,
      });
    } else if (durationMs > 1000) {
      logger.warn('⚠️ Slow database query detected (>1s)', {
        query: e.query?.substring(0, 200) || 'unknown',
        duration: durationMs,
      });
    }
  });
}

// Log database initialization
logger.info('[DB] Prisma Client initialized');

export default prisma;

let databaseClosed = false;

export async function closeDatabase(): Promise<void> {
  if (databaseClosed) return;
  databaseClosed = true;
  await prisma.$disconnect();
  await pool.end();
}

/**
 * Helper per soft delete: imposta deletedAt e aggiorna record.
 */
export async function softDelete<T extends { id: number }>(
  model: { update: (args: { where: { id: number }; data: { deletedAt: Date } }) => Promise<T> },
  id: number
): Promise<T> {
  return model.update({ where: { id }, data: { deletedAt: new Date() } });
}
