import { Pool } from 'pg';
import 'dotenv/config';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';

const pool = new Pool({ connectionString });

async function main() {
  console.log('🔄 Aggiornamento Enum TransactionType in PostgreSQL...');
  
  // 1. Add new enum values to PostgreSQL enum type if not exist
  await pool.query(`ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'ENTRATA';`);
  await pool.query(`ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'USCITA';`);
  
  // 2. Update existing rows
  await pool.query(`UPDATE "transactions" SET "type" = 'ENTRATA' WHERE "type"::text = 'INCOME';`);
  await pool.query(`UPDATE "transactions" SET "type" = 'USCITA' WHERE "type"::text = 'EXPENSE';`);
  
  console.log('✅ Aggiornamento righe PostgreSQL completato!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante la migrazione enum:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
