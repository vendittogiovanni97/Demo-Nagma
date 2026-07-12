import { Pool } from 'pg';
import { PrismaClient, StaffType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SQL_DIR = path.resolve(__dirname, '../../infrastructure/database');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ datasources: { db: { url: connectionString } } });

async function runSqlFiles(): Promise<void> {
  const files = fs
    .readdirSync(SQL_DIR)
    .filter((f) => f.startsWith('init_') && f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SQL_DIR, file), 'utf-8');

    // Rimuovi commenti SQL e split in statement
    const noComments = sql.replace(/^--.*$/gm, '').trim();
    const statements = noComments
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('already exists') || message.includes('duplicate key')) {
          console.warn(`     ⚠️  Skipped (duplicate): ${stmt.slice(0, 60)}...`);
        } else {
          throw err;
        }
      }
    }
  }
}

async function updatePasswordsFromEnv(): Promise<void> {
  const superAdminPw = process.env.SUPER_ADMIN_PASSWORD;
  const adminPw = process.env.ADMIN_PASSWORD;

  if (superAdminPw) {
    const hash = await bcrypt.hash(superAdminPw, 10);
    await prisma.user.updateMany({
      where: { email: 'superadmin@nagma.it', role: 'SUPER_ADMIN' },
      data: { password: hash },
    });
  }

  if (adminPw) {
    const hash = await bcrypt.hash(adminPw, 10);
    await prisma.user.updateMany({
      where: { email: { in: ['miriam@nagma.it', 'giuseppe@nagma.it'] } },
      data: { password: hash },
    });
  }
}

async function seedFormTemplates(): Promise<void> {
  const bookingFormSchema = [
    {
      type: 'select',
      name: 'tattooStyle',
      label: 'Stile Tatuaggio',
      options: [
        'Realistico', 'Tradizionale', 'Neotradizionale', 'Acquerello',
        'Blackwork', 'Minimal', 'Giapponese', 'Lettering', 'Geometrico', 'Altro',
      ],
    },
    { type: 'text', name: 'progettoTipo', label: 'Tipo di Progetto' },
    {
      type: 'select', name: 'grandezza', label: 'Grandezza',
      options: ['Piccolo (< 10cm)', 'Medio (10-20cm)', 'Grande (20-30cm)', 'Extra Large (> 30cm)'],
    },
    { type: 'text', name: 'posizione', label: 'Posizione corpo' },
  ];

  const schemaB64 = Buffer.from(JSON.stringify(bookingFormSchema)).toString('base64');

  const existing = await prisma.formTemplate.findFirst({ where: { name: 'Scheda Prenotazione Tattoo' } });
  if (!existing) {
    await prisma.formTemplate.create({ data: { name: 'Scheda Prenotazione Tattoo', schemaB64 } });
    console.log('  ✅ Form Template creato');
  }
}

async function seedCreamTattoo(): Promise<void> {
  await prisma.creamTattoo.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Crema Protettiva Tattoo', description: 'Crema lenitiva post-tatuaggio', isActive: true },
  });
  console.log('  ✅ Crema Tattoo creato');
}

async function seedShifts(): Promise<void> {
  const allStaff = await prisma.staff.findMany();
  if (allStaff.length === 0) return;

  const today = new Date();
  const currentDay = new Date(today);
  currentDay.setDate(today.getDate() - today.getDay() + 1);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 90);

  let count = 0;
  for (let d = new Date(currentDay); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);

    for (const staffMember of allStaff) {
      const existingShift = await prisma.shift.findFirst({
        where: { staffId: staffMember.id, date: day },
      });

      if (!existingShift) {
        await prisma.shift.create({
          data: { staffId: staffMember.id, date: day, startTime: '09:00', endTime: '19:00' },
        });
        count++;
      }
    }
  }
  console.log(`  ✅ Turni creati: ${count} (su ${allStaff.length} membri staff × 90 giorni)`);
}

async function main(): Promise<void> {
  console.log('\n🌱 Avvio seed database...\n');

  console.log('📁 Esecuzione file SQL da:', SQL_DIR);
  await runSqlFiles();

  console.log('\n🔐 Aggiornamento password da env...');
  await updatePasswordsFromEnv();

  console.log('\n📋 Seeding programmatico...');
  await seedFormTemplates();
  await seedCreamTattoo();
  await seedShifts();

  console.log('\n🎉 Seed completato con successo!');
  console.log('\n📋 Credenziali accesso:');
  console.log('   Super Admin: superadmin@nagma.it / ' + (process.env.SUPER_ADMIN_PASSWORD || 'superadmin123'));
  console.log('   Admin:       miriam@nagma.it / ' + (process.env.ADMIN_PASSWORD || 'admin123'));
  console.log('   Admin:       giuseppe@nagma.it / ' + (process.env.ADMIN_PASSWORD || 'admin123'));
}

main()
  .catch((e: Error) => {
    console.error('\n❌ Errore durante seed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
