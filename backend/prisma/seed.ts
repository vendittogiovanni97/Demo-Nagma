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
  } else if (cfg.bookingUpdatePassword && !existing.bookingUpdatePassword) {
    await prisma.clientConfig.update({
      where: { id: existing.id },
      data: { bookingUpdatePassword: cfg.bookingUpdatePassword },
    });
    console.log('  Booking password aggiornata');
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
