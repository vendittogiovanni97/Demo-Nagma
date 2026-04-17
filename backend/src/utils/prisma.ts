import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;

/**
 * Helper per soft delete: imposta deletedAt e aggiorna record.
 */
export async function softDelete<T extends { id: number }>(
  model: { update: (args: { where: { id: number }; data: { deletedAt: Date } }) => Promise<T> },
  id: number
): Promise<T> {
  return model.update({ where: { id }, data: { deletedAt: new Date() } });
}
