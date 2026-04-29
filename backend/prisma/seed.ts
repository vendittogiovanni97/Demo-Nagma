import { PrismaClient, StaffType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Setup locale — istanza Prisma autonoma per il seed
const connectionString = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

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
async function seedAdmins(): Promise<void> {
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

  const admins = [
    { name: 'Miriam', email: 'miriam@nagma.it' },
    { name: 'Giuseppe', email: 'giuseppe@nagma.it' },
  ];

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        name: admin.name,
        email: admin.email,
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin creato:', admin.email);
  }
}

/**
 * Seed WhatsApp Template (dati di sistema)
 */
async function seedWhatsAppTemplates(): Promise<void> {
  const templates = [
    {
      name: 'Conferma Appuntamento',
      category: 'Conferma',
      body: 'Ciao {{nome}}!\n\nTi confermiamo il tuo appuntamento per il {{data}} alle {{ora}}.\n\nRicorda di:\n• Mangiare qualcosa prima\n• Non bere alcolici 24h prima\n• Se hai domande scrivimi!\n\nA presto!',
      isActive: true,
    },
    {
      name: 'Promemoria Appuntamento',
      category: 'Promemoria',
      body: 'Ciao {{nome}}!\n\nTi ricordiamo che hai un appuntamento domani alle {{ora}}.\n\nSe non puoi più venire, per favore contattaci il prima possibile così possiamo riprogrammare.\n\nA domani!',
      isActive: true,
    },
    {
      name: 'Richiesta Caparra',
      category: 'Caparra',
      body: 'Ciao {{nome}}!\n\nPer confermare la prenotazione del {{data}} alle {{ora}}, ti chiediamo di versare una caparra di €30.\n\nPuoi versarla tramite:\n• Bonifico: IT00X0000000000000000000000\n• WhatsApp con satispay\n\nLasciaci la ricevuta una volta versato!',
      isActive: true,
    },
    {
      name: 'Conferma Caparra Ricevuta',
      category: 'Conferma',
      body: 'Ciao {{nome}}!\n\nAbbiamo ricevuto la caparra di €30 per l\'appuntamento del {{data}} alle {{ora}}.\n\nSei confermato!\n\nTi ricordiamo le istruzioni prima dell\'appuntamento:\n• Mangiare qualcosa prima\n• Non bere alcolici 24h prima\n• Portare documento',
      isActive: true,
    },
    {
      name: 'Tattoo Pronto',
      category: 'Info',
      body: 'Ciao {{nome}}!\n\nIl tuo tatuaggio è guarito bene! Per i prossimi 15 giorni:\n\nCura:\n• Applica crema lenitiva 2-3 volte al giorno\n• Lava con sapone neutro delicatamente\n\nEvita:\n• Non grattare, non esponi al sole\n• No piscine, mare, sauna\n\nSe hai dubbi scrivici!',
      isActive: true,
    },
    {
      name: 'Prenotazione Annullata',
      category: 'Annullamento',
      body: 'Ciao {{nome}}!\n\nAbbiamo cancellato la tua prenotazione del {{data}} alle {{ora}}.\n\nSe vuoi riprogrammare, scrivici qui!',
      isActive: true,
    },
    {
      name: 'Coupon Sconto',
      category: 'Marketing',
      body: 'Ciao {{nome}}!\n\nTi regaliamo il 10% di sconto sul tuo prossimo tatuaggio!\n\nCodice: TATTOO10\n\nLo sconto è valido per 3 mesi.\n\nPrenota quando vuoi!',
      isActive: true,
    },
    {
      name: 'Check Post Trattamento',
      category: 'Follow-up',
      body: 'Ciao {{nome}}!\n\nCome va il tatuaggio? È tutto okay?\n\nSe hai dubbi sulla guarigione o necessiti altre informazioni, siamo qui!',
      isActive: true,
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

  console.log('✅ Template WhatsApp creati:', templates.length);
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
 * Seed Config (parametri di sistema)
 * IMPORTANTE: BOOKING_UPDATE_PASSWORD deve essere impostata via .env, non ha default nel codice
 */
async function seedConfig(): Promise<void> {
  const configs = [
    // File Management
    {
      paramsKey: 'FILES_PATH',
      value: '/uploads/attachments/',
    },
    // Debug & Logging
    {
      paramsKey: 'DEBUG_HTTP',
      value: process.env.DEBUG_HTTP === 'true' ? 'true' : 'false',
    },
    {
      paramsKey: 'LOG_LEVEL',
      value: process.env.LOG_LEVEL || 'INFO',
    },
    // Security & Authentication
    {
      paramsKey: 'JWT_EXPIRY',
      value: process.env.JWT_EXPIRY || '8h',
    },
    {
      paramsKey: 'BCRYPT_SALT_ROUNDS',
      value: process.env.BCRYPT_SALT_ROUNDS || '10',
    },
    {
      paramsKey: 'LOGIN_RATE_LIMIT_WINDOW_MINUTES',
      value: process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES || '15',
    },
    {
      paramsKey: 'LOGIN_RATE_LIMIT_MAX_ATTEMPTS',
      value: process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || '5',
    },
    {
      paramsKey: 'SESSION_TIMEOUT_MINUTES',
      value: process.env.SESSION_TIMEOUT_MINUTES || '30',
    },
    // Pagination & Limits
    {
      paramsKey: 'MAX_PAGE_LIMIT',
      value: process.env.MAX_PAGE_LIMIT || '100',
    },
    // Application
    {
      paramsKey: 'APP_VERSION',
      value: process.env.APP_VERSION || '1.0.0',
    },
    // Booking & Security (no default password)
    {
      paramsKey: 'BOOKING_UPDATE_PASSWORD',
      value: process.env.BOOKING_UPDATE_PASSWORD || '',
    },
  ];

  for (const config of configs) {
    await prisma.config.upsert({
      where: { paramsKey: config.paramsKey },
      update: { value: config.value },
      create: config,
    });
  }

  console.log('✅ Config di sistema creati');
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

  // Seed shifts for ALL staff members for 90 days (full day: 09:00-19:00)
  const allStaff = await prisma.staff.findMany();
  const today = new Date();
  const currentDay = new Date(today);
  currentDay.setDate(today.getDate() - today.getDay() + 1);

  // Generate shifts for 90 days (about 3 months)
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 90);

for (let d = new Date(currentDay); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);

    for (const staffMember of allStaff) {
      const existingShift = await prisma.shift.findFirst({
        where: { staffId: staffMember.id, date: day }
      });
      if (!existingShift) {
        await prisma.shift.create({
          data: {
            staffId: staffMember.id,
            date: day,
            startTime: '09:00',
            endTime: '19:00',
          }
        });
      }
    }
  }

  console.log('✅ Staff creato (5 collaboratori + 3 apprendisti + turni 90 giorni)');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🌱 Avvio seed database...\n');

  await seedSuperAdmin();
  await seedAdmins();
  await seedConfig();
  await seedWhatsAppTemplates();
  await seedFormTemplates();
  await seedCreamTattoo();
  await seedDefaultStaff();

  console.log('\n🎉 Seed completato con successo!');
  console.log('\n📋 Credenziali accesso:');
  console.log('   Super Admin: superadmin@nagma.it / superadmin123');
  console.log('   Admin:       miriam@nagma.it / admin123');
  console.log('   Admin:       giuseppe@nagma.it / admin123');
}

main()
  .catch((e: Error) => {
    console.error('❌ Errore durante seed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
