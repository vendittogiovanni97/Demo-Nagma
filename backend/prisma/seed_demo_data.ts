import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, StaffType, BookingStatus, TransactionType } from '@prisma/client';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Popolamento dati demo in corso...');

  // 1. Staff
  let staffList = await prisma.staff.findMany({ where: { deletedAt: null } });
  if (staffList.length === 0) {
    const staff1 = await prisma.staff.create({ data: { name: 'Marco Rossi', type: StaffType.COLLABORATORE, color: '#00BFFF' } });
    const staff2 = await prisma.staff.create({ data: { name: 'Sara Conti', type: StaffType.COLLABORATORE, color: '#9d4edd' } });
    const staff3 = await prisma.staff.create({ data: { name: 'Luca Verdi', type: StaffType.APPRENDISTA, color: '#00f5d4' } });
    staffList = [staff1, staff2, staff3];
    console.log('✅ Creato staff demo (3 membri)');
  }

  const defaultArtistId = staffList[0].id;
  const secondArtistId = staffList[1]?.id || defaultArtistId;

  // 2. Clienti
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
  console.log(`✅ Clienti pronti (${customers.length} clienti)`);

  // 3. Prenotazioni per OGGI (21 Luglio 2026) e resto di Luglio
  const today = new Date('2026-07-21T00:00:00.000Z');
  
  const bookingsData = [
    {
      customerId: customers[0].id,
      artistId: defaultArtistId,
      date: new Date('2026-07-21T09:30:00.000Z'),
      duration: 120,
      status: BookingStatus.CONFERMATO,
      price: 250.00,
      deposit: 50.00,
      notes: 'Tatuaggio watercolor avambraccio',
    },
    {
      customerId: customers[1].id,
      artistId: secondArtistId,
      date: new Date('2026-07-21T12:00:00.000Z'),
      duration: 60,
      status: BookingStatus.CREATO,
      price: 80.00,
      deposit: 20.00,
      notes: 'Piercing lobo ed elice titanio',
    },
    {
      customerId: customers[2].id,
      artistId: defaultArtistId,
      date: new Date('2026-07-21T15:30:00.000Z'),
      duration: 150,
      status: BookingStatus.COMPLETATO,
      price: 380.00,
      deposit: 100.00,
      notes: 'Cover-up spalla destra con sfumature scure',
    },
    {
      customerId: customers[3].id,
      artistId: defaultArtistId,
      date: new Date('2026-07-22T10:00:00.000Z'),
      duration: 180,
      status: BookingStatus.CONFERMATO,
      price: 320.00,
      deposit: 80.00,
      notes: 'Tatuaggio Maori polpaccio',
    },
    {
      customerId: customers[4].id,
      artistId: secondArtistId,
      date: new Date('2026-07-23T14:00:00.000Z'),
      duration: 120,
      status: BookingStatus.CONFERMATO,
      price: 200.00,
      deposit: 40.00,
      notes: 'Lettering costato sinistro',
    },
    {
      customerId: customers[5].id,
      artistId: defaultArtistId,
      date: new Date('2026-07-24T16:00:00.000Z'),
      duration: 60,
      status: BookingStatus.ANNULLATO,
      price: 90.00,
      deposit: 0.00,
      notes: 'Disdetta per imprevisto lavoro',
    },
    {
      customerId: customers[0].id,
      artistId: secondArtistId,
      date: new Date('2026-07-28T11:00:00.000Z'),
      duration: 120,
      status: BookingStatus.CREATO,
      price: 220.00,
      deposit: 50.00,
      notes: 'Ritocco colore braccio',
    },
  ];

  let createdBookingsCount = 0;
  for (const bData of bookingsData) {
    const existing = await prisma.booking.findFirst({
      where: {
        customerId: bData.customerId,
        date: bData.date,
        deletedAt: null,
      },
    });
    if (!existing) {
      await prisma.booking.create({ data: bData });
      createdBookingsCount++;
    }
  }
  console.log(`✅ Prenotazioni inserite (${createdBookingsCount} nuove prenotazioni)`);

  // 4. Transazioni Finanziarie (Entrate e Uscite per Luglio 2026)
  const transactionsData = [
    {
      type: TransactionType.ENTRATA,
      category: 'Tatuaggi',
      description: 'Saldo Tatuaggio Watercolor - Giulia Rossi',
      amount: 200.00,
      date: new Date('2026-07-21T11:30:00.000Z'),
    },
    {
      type: TransactionType.ENTRATA,
      category: 'Cover Up',
      description: 'Saldo Cover Up - Elena Esposito',
      amount: 280.00,
      date: new Date('2026-07-21T18:00:00.000Z'),
    },
    {
      type: TransactionType.ENTRATA,
      category: 'Acconto',
      description: 'Acconto Tatuaggio Maori - Alessandro Romano',
      amount: 80.00,
      date: new Date('2026-07-20T16:00:00.000Z'),
    },
    {
      type: TransactionType.USCITA,
      category: 'Forniture',
      description: 'Acquisto aghi monouso e inchiostri neri',
      amount: 85.50,
      date: new Date('2026-07-18T10:00:00.000Z'),
    },
    {
      type: TransactionType.USCITA,
      category: 'Prodotti Studio',
      description: 'Saponi disinfettanti e pellicole protettive',
      amount: 42.00,
      date: new Date('2026-07-19T14:30:00.000Z'),
    },
  ];

  for (const tData of transactionsData) {
    const existing = await prisma.transaction.findFirst({
      where: { description: tData.description, deletedAt: null },
    });
    if (!existing) {
      await prisma.transaction.create({ data: tData });
    }
  }
  console.log('✅ Transazioni finanziarie di luglio inserite');

  console.log('🎉 Popolamento completato con successo!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il popolamento:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
