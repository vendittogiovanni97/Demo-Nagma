const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
    { name: 'Reminder 24h', category: 'Reminder', body: 'Ciao {{nome}}, ti ricordiamo che domani hai appuntamento alle {{ora}}. Per qualsiasi info siamo a disposizione! 📞' },
    { name: 'Auguri Compleanno', category: 'Marketing', body: 'Tanti auguri {{nome}}! 🎂 Per festeggiare ecco uno sconto del 10% sul tuo prossimo tattoo!' },
    { name: 'Follow-up Post Tattoo', category: 'Follow-up', body: 'Ciao {{nome}}, come sta andando la guarigione? Ricorda di applicare la crema come consigliato. Per dubbi scrivici! 💚' },
  ];

  for (const t of templates) {
    const existing = await prisma.whatsAppTemplate.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.whatsAppTemplate.create({ data: t });
    }
  }
  console.log('✅ Template WhatsApp creati');

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
