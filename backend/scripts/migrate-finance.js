const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('--- Starting Financial Migration ---');

  // 1. Sync Spese Libere
  const spese = await prisma.spesaLibera.findMany();
  console.log(`Found ${spese.length} Spese Libere.`);
  for (const s of spese) {
    const existing = await prisma.transaction.findFirst({
      where: { sourceId: s.id, sourceType: 'SPESA_LIBERA', deletedAt: null }
    });
    if (!existing) {
      await prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          category: 'Spese Libere',
          description: `Spesa Libera: ${s.name}`,
          amount: s.price,
          date: s.createdAt,
          sourceId: s.id,
          sourceType: 'SPESA_LIBERA',
        }
      });
      console.log(`Migrated Spesa Libera: ${s.name}`);
    }
  }

  // 2. Sync Completed Bookings
  const bookings = await prisma.booking.findMany({
    where: { status: 'COMPLETATO', deletedAt: null }
  });
  console.log(`Found ${bookings.length} Completed Bookings.`);
  for (const b of bookings) {
    const existing = await prisma.transaction.findFirst({
      where: { sourceId: b.id, sourceType: 'BOOKING', deletedAt: null }
    });
    if (!existing) {
      // INCOME
      await prisma.transaction.create({
        data: {
          type: 'INCOME',
          category: 'Tatuaggio',
          description: `Incasso prenotazione #${b.id}`,
          amount: b.price || 0,
          date: b.date,
          sourceId: b.id,
          sourceType: 'BOOKING',
        }
      });

      // EXPENSE (commission)
      const fd = b.formData;
      const artistPrice = fd && typeof fd.artistPrice === 'number' ? fd.artistPrice : 0;
      if (artistPrice > 0) {
        await prisma.transaction.create({
          data: {
            type: 'EXPENSE',
            category: 'Compenso Artista',
            description: `Compenso artista — prenotazione #${b.id}`,
            amount: artistPrice,
            date: b.date,
            sourceId: b.id,
            sourceType: 'BOOKING_COMMISSION', // Different type to avoid confusion
          }
        });
      }
      console.log(`Migrated Booking #${b.id}`);
    }
  }

  console.log('--- Migration Completed ---');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
