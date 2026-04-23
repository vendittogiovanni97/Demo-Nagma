import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, StaffType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Pool } from 'pg';

// Setup locale — istanza Prisma autonoma per il seed
const connectionString = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed Super Admin (accesso completo)
 */
async function seedSuperAdmin(): Promise<void> {
  const superAdminPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'superadmin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@nagma.it' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@nagma.it',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin creato:', superAdmin.email);
}

/**
 * Seed Admin di default (obbligatorio per accedere)
 */
async function seedAdmin(): Promise<void> {
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nagma.it' },
    update: {},
    create: {
      name: 'Admin Nagma',
      email: 'admin@nagma.it',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin creato:', admin.email);
}

/**
 * Seed Template WhatsApp (dati di sistema)
 */
async function seedWhatsAppTemplates(): Promise<void> {
  const templates = [
    {
      name: 'Conferma Appuntamento',
      category: 'Conferma',
      body: 'Ciao {{nome}}! Ti confermiamo l\'appuntamento per il {{data}} alle {{ora}}. A presto! 🎨',
    },
  ];

  for (const t of templates) {
    const existing = await prisma.whatsAppTemplate.findFirst({
      where: { name: t.name },
    });
    if (!existing) {
      await prisma.whatsAppTemplate.create({ data: t });
    }
  }

  console.log('✅ Template WhatsApp creati');
}

/**
 * Seed Form Template di default per Booking
 */
async function seedFormTemplates(): Promise<void> {
  const bookingFormSchema = [
    {
      type: 'select',
      name: 'tattooStyle',
      label: 'Stile Tatuaggio',
      options: [
        'Realistico',
        'Tradizionale',
        'Neotradizionale',
        'Acquerello',
        'Blackwork',
        'Minimal',
        'Giapponese',
        'Lettering',
        'Geometrico',
        'Altro',
      ],
    },
    {
      type: 'text',
      name: 'progettoTipo',
      label: 'Tipo di Progetto',
    },
    {
      type: 'select',
      name: 'grandezza',
      label: 'Grandezza',
      options: [
        'Piccolo (< 10cm)',
        'Medio (10-20cm)',
        'Grande (20-30cm)',
        'Extra Large (> 30cm)',
      ],
    },
    {
      type: 'text',
      name: 'posizione',
      label: 'Posizione corpo',
    },
  ];

  const schemaB64 = Buffer.from(JSON.stringify(bookingFormSchema)).toString('base64');

  const existingTemplate = await prisma.formTemplate.findFirst({
    where: { name: 'Scheda Prenotazione Tattoo' },
  });
  if (!existingTemplate) {
    await prisma.formTemplate.create({
      data: {
        name: 'Scheda Prenotazione Tattoo',
        schemaB64,
      },
    });
  }

  console.log('✅ Form Template prenotazione creato');
}

/**
 * Seed Crema Tattoo
 */
async function seedCreamTattoo(): Promise<void> {
  await prisma.creamTattoo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Crema Protettiva Tattoo',
      description: 'Crema lenitiva post-tatuaggio',
      isActive: true,
    },
  });
  console.log('✅ Crema Tattoo creato');
}
async function seedDefaultStaff(): Promise<void> {
  const members = [
    // Collaboratori
    { name: 'Giuseppe Savoia',   type: StaffType.COLLABORATORE, color: '#3b82f6' },
    { name: 'Aniello Gozzi',     type: StaffType.COLLABORATORE, color: '#10b981' },
    { name: 'Pietro Russo',      type: StaffType.COLLABORATORE, color: '#f59e0b' },
    { name: 'Lorenzo Vignone',   type: StaffType.COLLABORATORE, color: '#ef4444' },
    { name: 'Vincenzo Santoro',  type: StaffType.COLLABORATORE, color: '#8b5cf6' },
    // Apprendisti
    { name: 'Martina Paolino',   type: StaffType.APPRENDISTA,   color: '#ec4899' },
    { name: 'Genny Diotiaiuti',  type: StaffType.APPRENDISTA,   color: '#06b6d4' },
    { name: 'Boston',            type: StaffType.APPRENDISTA,   color: '#f97316' },
  ];

  for (const member of members) {
    const existing = await prisma.staff.findFirst({ where: { name: member.name } });
    if (!existing) {
      await prisma.staff.create({ data: member });
    }
  }

  // Seed shifts for Giuseppe Savoia
  const giuseppe = await prisma.staff.findFirst({ where: { name: 'Giuseppe Savoia' } });
  if (giuseppe) {
    const shiftDate = new Date('2026-04-13');
    const shifts = [
      { date: shiftDate, startTime: '09:00', endTime: '13:00' },
      { date: shiftDate, startTime: '14:00', endTime: '19:00' },
    ];

    for (const shift of shifts) {
      const existing = await prisma.shift.findFirst({
        where: { staffId: giuseppe.id, date: shift.date, startTime: shift.startTime }
      });
      if (!existing) {
        await prisma.shift.create({
          data: { ...shift, staffId: giuseppe.id }
        });
      }
    }
  }

  console.log('✅ Staff creato (5 collaboratori + 3 apprendisti + turni');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🌱 Avvio seed database...\n');

  await seedSuperAdmin();
  await seedAdmin();
  await seedWhatsAppTemplates();
  await seedFormTemplates();
  await seedCreamTattoo();
  await seedDefaultStaff();

  console.log('\n🎉 Seed completato con successo!');
  console.log('\n📋 Credenziali accesso:');
  console.log('   Super Admin: superadmin@nagma.it / superadmin123');
  console.log('   Admin:       admin@nagma.it / admin123');
}

main()
  .catch((e: Error) => {
    console.error('❌ Errore durante seed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
