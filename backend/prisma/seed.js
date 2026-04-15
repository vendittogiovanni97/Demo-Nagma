const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

// Setup adapter for direct database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';
const { Pool } = require('pg');
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Inizio seed database...\n');

  // ── Admin di default (obbligatorio per accedere) ──
  const adminPassword = await bcrypt.hash('admin123', 10);

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

  // ── Template WhatsApp (dati di sistema) ──
  const templates = [
    { name: 'Conferma Appuntamento', category: 'Conferma', body: 'Ciao {{nome}}! Ti confermiamo l\'appuntamento per il {{data}} alle {{ora}}. A presto! 🎨' },
  ];

  for (const t of templates) {
    const existing = await prisma.whatsAppTemplate.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.whatsAppTemplate.create({ data: t });
    }
  }
  console.log('✅ Template WhatsApp creati');

  // ── Form Template di default per Booking ──
  const bookingFormSchema = [
    {
      type: 'select',
      name: 'tattooStyle',
      label: 'Stile Tatuaggio',
      options: ['Realistico', 'Tradizionale', 'Neotradizionale', 'Acquerello', 'Blackwork', 'Minimal', 'Giapponese', 'Lettering', 'Geometrico', 'Altro'],
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
      options: ['Piccolo (< 10cm)', 'Medio (10-20cm)', 'Grande (20-30cm)', 'Extra Large (> 30cm)'],
    },
    {
      type: 'text',
      name: 'posizione',
      label: 'Posizione corpo',
    },
  ];

  const schemaB64 = Buffer.from(JSON.stringify(bookingFormSchema)).toString('base64');

  const existingTemplate = await prisma.formTemplate.findFirst({ where: { name: 'Scheda Prenotazione Tattoo' } });
  if (!existingTemplate) {
    await prisma.formTemplate.create({
      data: {
        name: 'Scheda Prenotazione Tattoo',
        schemaB64,
      },
    });
  }
  console.log('✅ Form Template prenotazione creato');

  console.log('\n🎉 Seed completato con successo!');
  console.log('\n📋 Credenziali accesso:');
  console.log('   Admin:   admin@nagma.it / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
