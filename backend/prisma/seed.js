const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizio seed database...\n');

  // ── Utenti ──
  const adminPassword = await bcrypt.hash('admin123', 10);
  const artistPassword = await bcrypt.hash('artist123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nagma.it' },
    update: {},
    create: {
      name: 'Admin Nagma',
      email: 'admin@nagma.it',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+39 02 1234567',
      color: '#ef4444',
    },
  });
  console.log('✅ Admin creato:', admin.email);

  const artist1 = await prisma.user.upsert({
    where: { email: 'marco@nagma.it' },
    update: {},
    create: {
      name: 'Marco Rossi',
      email: 'marco@nagma.it',
      password: artistPassword,
      role: 'ARTIST',
      phone: '+39 333 111222',
      color: '#3b82f6',
    },
  });
  console.log('✅ Artista creato:', artist1.name);

  const artist2 = await prisma.user.upsert({
    where: { email: 'lucia@nagma.it' },
    update: {},
    create: {
      name: 'Lucia Bianchi',
      email: 'lucia@nagma.it',
      password: artistPassword,
      role: 'ARTIST',
      phone: '+39 333 333444',
      color: '#10b981',
    },
  });
  console.log('✅ Artista creata:', artist2.name);

  const user = await prisma.user.upsert({
    where: { email: 'reception@nagma.it' },
    update: {},
    create: {
      name: 'Reception',
      email: 'reception@nagma.it',
      password: await bcrypt.hash('user123', 10),
      role: 'USER',
      phone: '+39 02 1234568',
    },
  });
  console.log('✅ User creato:', user.email);

  // ── Clienti ──
  const customers = [];
  const customerData = [
    { firstName: 'Giuseppe', lastName: 'Verdi', phone: '+39 340 111111', email: 'giuseppe@email.it', notes: 'Cliente abituale, allergico al rosso' },
    { firstName: 'Anna', lastName: 'Ferrari', phone: '+39 340 222222', email: 'anna@email.it', notes: 'Primo appuntamento, idea realistico' },
    { firstName: 'Luca', lastName: 'Romano', phone: '+39 340 333333', email: 'luca@email.it', notes: 'Touch-up richiesto dopo 3 mesi' },
    { firstName: 'Sara', lastName: 'Colombo', phone: '+39 340 444444', email: 'sara@email.it', notes: 'Vuole tattoo minimal polso' },
    { firstName: 'Matteo', lastName: 'Ricci', phone: '+39 340 555555', email: 'matteo@email.it', notes: 'Manga sleeve, 4 sedute previste' },
  ];

  for (const c of customerData) {
    const customer = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c,
    });
    customers.push(customer);
    console.log(`✅ Cliente creato: ${c.firstName} ${c.lastName}`);
  }

  // ── Appuntamenti ──
  const now = new Date();
  const bookings = [];
  const bookingData = [
    { customer: customers[0], artist: artist1, date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), duration: 180, status: 'CONFIRMED', type: 'Tattoo', price: 350, deposit: 50, notes: 'Tribal braccio destro' },
    { customer: customers[1], artist: artist2, date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), duration: 240, status: 'CONFIRMED', type: 'Tattoo', price: 500, deposit: 100, notes: 'Ritratto realistico gatto' },
    { customer: customers[2], artist: artist1, date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), duration: 60, status: 'COMPLETED', type: 'Touch-up', price: 0, deposit: 0, notes: 'Ritocco vecchio tattoo' },
    { customer: customers[3], artist: artist2, date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), duration: 90, status: 'CONFIRMED', type: 'Tattoo', price: 150, deposit: 30, notes: 'Minimal cuore polso' },
    { customer: customers[4], artist: artist1, date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), duration: 300, status: 'CONFIRMED', type: 'Tattoo', price: 800, deposit: 100, notes: 'Manga sleeve - seduta 2/4' },
    { customer: customers[0], artist: artist2, date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), duration: 120, status: 'COMPLETED', type: 'Consulenza', price: 0, deposit: 0, notes: 'Consulto design personalizzato' },
  ];

  for (const b of bookingData) {
    const booking = await prisma.booking.create({
      data: {
        customerId: b.customer.id,
        artistId: b.artist.id,
        date: b.date,
        duration: b.duration,
        status: b.status,
        type: b.type,
        price: b.price,
        deposit: b.deposit,
        notes: b.notes,
      },
    });
    bookings.push(booking);
    console.log(`✅ Appuntamento: ${b.customer.firstName} → ${b.artist.name} (${b.type})`);
  }

  // ── Transazioni ──
  const transactionData = [
    { type: 'INCOME', category: 'Servizio', description: 'Tattoo tribal Giuseppe', amount: 350, date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), artistId: artist1.id },
    { type: 'INCOME', category: 'Acconto', description: 'Acconto Matteo manga sleeve', amount: 100, date: now, artistId: artist1.id },
    { type: 'EXPENSE', category: 'Materiali', description: 'Aghi e inchiostri', amount: 250, date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    { type: 'EXPENSE', category: 'Affitto', description: 'Affitto locale aprile', amount: 1500, date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { type: 'INCOME', category: 'Servizio', description: 'Touch-up Luca', amount: 0, date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), artistId: artist1.id },
    { type: 'EXPENSE', category: 'Utenze', description: 'Bolletta luce marzo', amount: 180, date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
  ];

  for (const t of transactionData) {
    await prisma.transaction.create({ data: t });
    console.log(`✅ Transazione: ${t.type} - ${t.description} (€${t.amount})`);
  }

  // ── Creme/Prodotti ──
  const creams = [];
  const creamData = [
    { name: 'Bepanthenol', brand: 'Bayer', price: 12.50, stock: 15 },
    { name: 'Hustle Butter', brand: 'Hustle Butter', price: 28.00, stock: 8 },
    { name: 'Dermalive', brand: 'Ducastel', price: 22.00, stock: 5 },
    { name: 'Tattoo Goo', brand: 'Tattoo Goo Co.', price: 15.00, stock: 12 },
  ];

  for (const cr of creamData) {
    const cream = await prisma.cream.upsert({
      where: { name: cr.name },
      update: {},
      create: cr,
    });
    creams.push(cream);
    console.log(`✅ Prodotto: ${cr.name} (stock: ${cr.stock})`);
  }

  // ── Vendite Creme ──
  await prisma.creamSale.create({
    data: { creamId: creams[0].id, sellerId: artist1.id, customerId: customers[0].id, quantity: 1, totalPrice: 12.50 },
  });
  console.log(`✅ Vendita: ${creams[0].name} → ${customers[0].firstName}`);

  // ── Turni ──
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const shiftData = [
    { user: artist1, weekStart: monday, dayOfWeek: 0, startTime: '09:00', endTime: '18:00' },
    { user: artist1, weekStart: monday, dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
    { user: artist1, weekStart: monday, dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
    { user: artist1, weekStart: monday, dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
    { user: artist1, weekStart: monday, dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
    { user: artist1, weekStart: monday, dayOfWeek: 5, startTime: '10:00', endTime: '16:00' },
    { user: artist1, weekStart: monday, dayOfWeek: 6, isOff: true },
    { user: artist2, weekStart: monday, dayOfWeek: 0, startTime: '10:00', endTime: '19:00' },
    { user: artist2, weekStart: monday, dayOfWeek: 1, startTime: '10:00', endTime: '19:00' },
    { user: artist2, weekStart: monday, dayOfWeek: 2, startTime: '10:00', endTime: '19:00' },
    { user: artist2, weekStart: monday, dayOfWeek: 3, startTime: '10:00', endTime: '19:00' },
    { user: artist2, weekStart: monday, dayOfWeek: 4, startTime: '10:00', endTime: '19:00' },
    { user: artist2, weekStart: monday, dayOfWeek: 5, isOff: true },
    { user: artist2, weekStart: monday, dayOfWeek: 6, isOff: true },
  ];

  for (const s of shiftData) {
    await prisma.shift.create({
      data: { userId: s.user.id, weekStart: s.weekStart, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, isOff: s.isOff || false },
    });
  }
  console.log('✅ Turni settimana corrente creati');

  // ── Template WhatsApp ──
  const templates = [
    { name: 'Conferma Appuntamento', category: 'Conferma', body: 'Ciao {{nome}}! Ti confermiamo l\'appuntamento per il {{data}} alle {{ora}}. A presto! 🎨' },
    { name: 'Reminder 24h', category: 'Reminder', body: 'Ciao {{nome}}, ti ricordiamo che domani hai appuntamento alle {{ora}}. Per qualsiasi info siamo a disposizione! 📞' },
    { name: 'Auguri Compleanno', category: 'Marketing', body: 'Tanti auguri {{nome}}! 🎂 Per festeggiare ecco uno sconto del 10% sul tuo prossimo tattoo!' },
    { name: 'Follow-up Post Tattoo', category: 'Follow-up', body: 'Ciao {{nome}}, come sta andando la guarigione? Ricorda di applicare la crema come consigliato. Per dubbi scrivici! 💚' },
  ];

  for (const t of templates) {
    await prisma.whatsAppTemplate.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
  }
  console.log('✅ Template WhatsApp creati');

  console.log('\n🎉 Seed completato con successo!');
  console.log('\n📋 Credenziali accesso:');
  console.log('   Admin:   admin@nagma.it / admin123');
  console.log('   Artist:  marco@nagma.it / artist123');
  console.log('   Artist:  lucia@nagma.it / artist123');
  console.log('   User:    reception@nagma.it / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
