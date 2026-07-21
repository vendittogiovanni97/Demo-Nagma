import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, StaffType } from '@prisma/client';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;
const SEED_PROFILE = process.env.SEED_PROFILE || 'nagma';

interface AccountSeed {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface SeedData {
  clientName: string;
  accounts: AccountSeed[];
  staff: Array<{ name: string; type: string; color: string }>;
  configs: Array<{ paramsKey: string; value: string }>;
  whatsappTemplates: Array<{ name: string; category: string; body: string }>;
  formTemplate: { name: string; schemaB64: string };
  creamTattoo: { name: string; description: string };
  clientConfig: {
    clientName: string;
    clientLogoUrl: string;
    clientTimeZone: string;
    clientLocale: string;
    primaryColor: string;
    secondaryColor: string;
    bookingUpdatePassword: string;
    features: Record<string, boolean>;
    maxUsers: number;
    maxBookings: number;
    maxAttachmentSizeMB: number;
    apiRateLimitPerMinute: number;
    customFields: Record<string, unknown>;
  };
}

function loadSeedData(): SeedData {
  const dataPath = path.resolve(__dirname, `seed-data/${SEED_PROFILE}.json`);
  if (!fs.existsSync(dataPath)) {
    console.error(`Profilo seed "${SEED_PROFILE}" non trovato in ${dataPath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, SALT_ROUNDS);
}

async function seedAccounts(accounts: AccountSeed[]): Promise<void> {
  for (const acc of accounts) {
    const hashed = await hashPassword(acc.password);
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { password: hashed },
      create: { name: acc.name, email: acc.email, role: acc.role as any, password: hashed },
    });
  }
  console.log(`  ${accounts.length} account`);
}

async function seedStaff(members: SeedData['staff']): Promise<void> {
  for (const member of members) {
    const existing = await prisma.staff.findFirst({ where: { name: member.name } });
    if (!existing) {
      await prisma.staff.create({
        data: { ...member, type: member.type as StaffType },
      });
    }
  }
  console.log(`  ${members.length} staff`);
}

async function seedConfigs(configs: SeedData['configs']): Promise<void> {
  for (const cfg of configs) {
    await prisma.config.upsert({
      where: { paramsKey: cfg.paramsKey },
      update: {},
      create: cfg,
    });
  }
  console.log(`  ${configs.length} config`);
}

async function seedWhatsAppTemplates(templates: SeedData['whatsappTemplates']): Promise<void> {
  for (const tpl of templates) {
    const existing = await prisma.whatsAppTemplate.findFirst({ where: { name: tpl.name } });
    if (!existing) {
      await prisma.whatsAppTemplate.create({ data: { ...tpl, isActive: true } });
    }
  }
  console.log(`  ${templates.length} template WhatsApp`);
}

async function seedFormTemplate(tpl: SeedData['formTemplate']): Promise<void> {
  const existing = await prisma.formTemplate.findFirst({ where: { name: tpl.name } });
  if (!existing) {
    await prisma.formTemplate.create({ data: tpl });
    console.log('  Form Template');
  }
}

async function seedCreamTattoo(cream: SeedData['creamTattoo']): Promise<void> {
  await prisma.creamTattoo.upsert({
    where: { id: 1 },
    update: {},
    create: { ...cream, isActive: true },
  });
  console.log('  Crema Tattoo');
}

async function seedClientConfig(cfg: SeedData['clientConfig']): Promise<void> {
  const existing = await prisma.clientConfig.findFirst();
  if (!existing) {
    await prisma.clientConfig.create({ data: cfg as any });
    console.log(`  ClientConfig "${cfg.clientName}"`);
  } else {
    // Aggiorna sempre i campi di branding per non lasciare valori stale
    await prisma.clientConfig.update({
      where: { id: existing.id },
      data: {
        clientLogoUrl: cfg.clientLogoUrl,
        primaryColor: cfg.primaryColor,
        secondaryColor: cfg.secondaryColor,
        clientName: cfg.clientName,
        ...(cfg.bookingUpdatePassword && !existing.bookingUpdatePassword
          ? { bookingUpdatePassword: cfg.bookingUpdatePassword }
          : {}),
      },
    });
    console.log('  ClientConfig aggiornata (logo + colori)');
  }
}

async function seedShifts(staffCount: number): Promise<void> {
  if (staffCount === 0) return;

  const allStaff = await prisma.staff.findMany();
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
  console.log(`  ${count} turni (${allStaff.length} staff x 90gg)`);
}

async function seedUserPreferences(): Promise<void> {
  const users = await prisma.user.findMany({ where: { deletedAt: null } });
  let count = 0;
  for (const user of users) {
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        language: 'it',
        timezone: 'Europe/Rome',
        dateFormat: 'DD/MM/YYYY',
        itemsPerPage: 25,
        emailNotifications: true,
        inAppNotifications: true,
      },
    });
    count++;
  }
  console.log(`  ${count} preferenze utente`);
}

async function seedSavedViews(): Promise<void> {
  const users = await prisma.user.findMany({ where: { deletedAt: null } });
  if (users.length === 0) return;

  // Viste di esempio per il superadmin (primo utente)
  const superAdmin = users.find((u) => u.role === 'SUPER_ADMIN') || users[0];

  const defaultViews = [
    {
      userId: superAdmin.id,
      module: 'customer',
      name: 'Tutti i Clienti',
      filters: [],
      columns: ['firstName', 'lastName', 'phone', 'email', 'createdAt'],
      sort: { field: 'lastName', direction: 'asc' },
      isDefault: true,
      isPublic: true,
    },
    {
      userId: superAdmin.id,
      module: 'customer',
      name: 'Clienti Recenti (30gg)',
      filters: [{ field: 'createdAt', operator: 'greaterThan', value: '30days', logic: 'AND' }],
      columns: ['firstName', 'lastName', 'phone', 'createdAt'],
      sort: { field: 'createdAt', direction: 'desc' },
      isDefault: false,
      isPublic: true,
    },
    {
      userId: superAdmin.id,
      module: 'booking',
      name: 'Prenotazioni di Oggi',
      filters: [{ field: 'date', operator: 'equals', value: 'today', logic: 'AND' }],
      columns: ['date', 'time', 'customer', 'artist', 'status', 'price'],
      sort: { field: 'date', direction: 'asc' },
      isDefault: true,
      isPublic: true,
    },
    {
      userId: superAdmin.id,
      module: 'booking',
      name: 'Da Completare',
      filters: [{ field: 'status', operator: 'equals', value: 'IN_ATTESA', logic: 'AND' }],
      columns: ['date', 'time', 'customer', 'artist', 'status'],
      sort: { field: 'date', direction: 'asc' },
      isDefault: false,
      isPublic: false,
    },
    {
      userId: superAdmin.id,
      module: 'finance',
      name: 'Entrate del Mese',
      filters: [
        { field: 'type', operator: 'equals', value: 'INCOME', logic: 'AND' },
        { field: 'date', operator: 'greaterThan', value: 'startOfMonth', logic: 'AND' },
      ],
      columns: ['date', 'description', 'amount', 'category'],
      sort: { field: 'date', direction: 'desc' },
      isDefault: false,
      isPublic: false,
    },
  ];

  let count = 0;
  for (const view of defaultViews) {
    const existing = await prisma.savedView.findFirst({
      where: { userId: view.userId, module: view.module, name: view.name },
    });
    if (!existing) {
      await prisma.savedView.create({ data: view as any });
      count++;
    }
  }
  console.log(`  ${count} viste salvate`);
}

async function seedDemoData(): Promise<void> {
  const staffList = await prisma.staff.findMany({ where: { deletedAt: null } });
  if (staffList.length === 0) return;

  const defaultArtistId = staffList[0].id;
  const secondArtistId = staffList[1]?.id || defaultArtistId;

  const customersData = [
    { firstName: 'Giulia', lastName: 'Rossi', phone: '+393331234567', email: 'giulia.rossi@example.com', notes: 'Cliente abituale per tatuaggi watercolor' },
    { firstName: 'Marco', lastName: 'Bianchi', phone: '+393479876543', email: 'marco.bianchi@example.com', notes: 'Prefisce appuntamenti nel pomeriggio' },
    { firstName: 'Elena', lastName: 'Esposito', phone: '+393205554433', email: 'elena.esposito@example.com', notes: 'Allergica al nichel, usare guanti speciali' },
    { firstName: 'Alessandro', lastName: 'Romano', phone: '+393381122334', email: 'alessandro.romano@example.com', notes: 'Primo tatuaggio maori braccio destro' },
    { firstName: 'Sofia', lastName: 'Conti', phone: '+393409988776', email: 'sofia.conti@example.com', notes: 'Richiede crema lenitiva dopo seduta' },
    { firstName: 'Matteo', lastName: 'Bruno', phone: '+393394455667', email: 'matteo.bruno@example.com', notes: 'Interessato a piercing e gioielli in titanio' },
  ];

  const customers = [];
  for (const cData of customersData) {
    const existing = await prisma.customer.findFirst({ where: { phone: cData.phone, deletedAt: null } });
    if (!existing) {
      const created = await prisma.customer.create({ data: cData });
      customers.push(created);
    } else {
      customers.push(existing);
    }
  }

  const bookingsData = [
    { customerId: customers[0].id, artistId: defaultArtistId, date: new Date('2026-07-21T09:30:00.000Z'), duration: 120, status: 'CONFERMATO' as any, price: 250.00, deposit: 50.00, notes: 'Tatuaggio watercolor avambraccio' },
    { customerId: customers[1].id, artistId: secondArtistId, date: new Date('2026-07-21T12:00:00.000Z'), duration: 60, status: 'CREATO' as any, price: 80.00, deposit: 20.00, notes: 'Piercing lobo ed elice titanio' },
    { customerId: customers[2].id, artistId: defaultArtistId, date: new Date('2026-07-21T15:30:00.000Z'), duration: 150, status: 'COMPLETATO' as any, price: 380.00, deposit: 100.00, notes: 'Cover-up spalla destra con sfumature scure' },
    { customerId: customers[3].id, artistId: defaultArtistId, date: new Date('2026-07-22T10:00:00.000Z'), duration: 180, status: 'CONFERMATO' as any, price: 320.00, deposit: 80.00, notes: 'Tatuaggio Maori polpaccio' },
    { customerId: customers[4].id, artistId: secondArtistId, date: new Date('2026-07-23T14:00:00.000Z'), duration: 120, status: 'CONFERMATO' as any, price: 200.00, deposit: 40.00, notes: 'Lettering costato sinistro' },
    { customerId: customers[5].id, artistId: defaultArtistId, date: new Date('2026-07-24T16:00:00.000Z'), duration: 60, status: 'ANNULLATO' as any, price: 90.00, deposit: 0.00, notes: 'Disdetta per imprevisto lavoro' },
    { customerId: customers[0].id, artistId: secondArtistId, date: new Date('2026-07-28T11:00:00.000Z'), duration: 120, status: 'CREATO' as any, price: 220.00, deposit: 50.00, notes: 'Ritocco colore braccio' },
  ];

  for (const bData of bookingsData) {
    const existing = await prisma.booking.findFirst({ where: { customerId: bData.customerId, date: bData.date, deletedAt: null } });
    if (!existing) {
      await prisma.booking.create({ data: bData });
    }
  }

  const transactionsData = [
    { type: 'ENTRATA' as any, category: 'Tatuaggi', description: 'Saldo Tatuaggio Watercolor - Giulia Rossi', amount: 200.00, date: new Date('2026-07-21T11:30:00.000Z') },
    { type: 'ENTRATA' as any, category: 'Cover Up', description: 'Saldo Cover Up - Elena Esposito', amount: 280.00, date: new Date('2026-07-21T18:00:00.000Z') },
    { type: 'ENTRATA' as any, category: 'Acconto', description: 'Acconto Tatuaggio Maori - Alessandro Romano', amount: 80.00, date: new Date('2026-07-20T16:00:00.000Z') },
    { type: 'USCITA' as any, category: 'Forniture', description: 'Acquisto aghi monouso e inchiostri neri', amount: 85.50, date: new Date('2026-07-18T10:00:00.000Z') },
    { type: 'USCITA' as any, category: 'Prodotti Studio', description: 'Saponi disinfettanti e pellicole protettive', amount: 42.00, date: new Date('2026-07-19T14:30:00.000Z') },
  ];

  for (const tData of transactionsData) {
    const existing = await prisma.transaction.findFirst({ where: { description: tData.description, deletedAt: null } });
    if (!existing) {
      await prisma.transaction.create({ data: tData });
    }
  }

  console.log('  Dati demo (6 clienti, 7 prenotazioni, 5 transazioni)');
}

async function main(): Promise<void> {
  console.log(`\nSeed [${SEED_PROFILE}]\n`);

  const data = loadSeedData();

  await seedAccounts(data.accounts);
  await seedStaff(data.staff);
  await seedConfigs(data.configs);
  await seedWhatsAppTemplates(data.whatsappTemplates);
  await seedFormTemplate(data.formTemplate);
  await seedCreamTattoo(data.creamTattoo);
  await seedClientConfig(data.clientConfig);
  await seedShifts(data.staff.length);
  await seedUserPreferences();
  await seedSavedViews();
  await seedDemoData();

  console.log(`\nDone: ${data.clientConfig.clientName}`);
  console.log(`Staff: ${data.staff.length}, Account: ${data.accounts.length}`);
}

main()
  .catch((e: Error) => {
    console.error(`\n[${SEED_PROFILE}]`, e.message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });

