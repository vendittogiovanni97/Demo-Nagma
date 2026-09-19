/**
 * Dati di prova per l'area finanziaria.
 * Copre transazioni di ogni categoria, entrate e spese libere, acconti,
 * affitti postazione e vendite crema, distribuiti su piu' mesi.
 *
 * Esecuzione: npm run db:seed:finance --prefix backend
 */

import 'dotenv/config';

import { Prisma, TransactionType } from '@prisma/client';

import prisma from '../src/core/shared/utils/prisma';

const CATEGORIE_ENTRATA = ['Servizi', 'Vendita Prodotti', 'Corsi', 'Acconto', 'Altro'];
const CATEGORIE_USCITA = ['Affitto', 'Forniture', 'Marketing', 'Utenze', 'Pulizie', 'Stipendi', 'Tasse', 'Altro'];

/** Data nel mese indicato: 0 = mese corrente, -1 = mese scorso. */
function giorno(offsetMese: number, giornoDelMese: number, ora = 10): Date {
  const oggi = new Date();
  return new Date(oggi.getFullYear(), oggi.getMonth() + offsetMese, giornoDelMese, ora, 0, 0, 0);
}

const ENTRATE: Array<[number, number, string, string, number, string | null]> = [
  // mese, giorno, categoria, descrizione, importo, allegato
  [0, 3, 'Servizi', 'Tatuaggio braccio - Luca Verdi', 450, null],
  [0, 7, 'Servizi', 'Tatuaggio schiena - Anna Neri', 800, 'ricevuta-0007.pdf'],
  [0, 11, 'Vendita Prodotti', 'Crema protettiva x3', 45, null],
  [0, 14, 'Corsi', 'Corso base igiene - 2 partecipanti', 600, 'fattura-corso-02.pdf'],
  [0, 18, 'Acconto', 'Acconto tatuaggio manica', 150, null],
  [0, 22, 'Altro', 'Rimborso assicurativo', 320, 'polizza-rimborso.pdf'],
  [0, 26, 'Servizi', 'Ritocco gratuito convertito in seduta', 120, null],
  [-1, 5, 'Servizi', 'Tatuaggio gamba - Marco Blu', 380, null],
  [-1, 12, 'Vendita Prodotti', 'Kit aftercare x5', 75, null],
  [-1, 19, 'Corsi', 'Corso avanzato ombreggiatura', 900, 'fattura-corso-01.pdf'],
  [-1, 24, 'Acconto', 'Acconto sessione full back', 250, null],
  [-2, 8, 'Servizi', 'Tatuaggio polso - Sara Gialli', 200, null],
  [-2, 16, 'Altro', 'Vendita attrezzatura usata', 400, null],
];

const USCITE: Array<[number, number, string, string, number, string | null]> = [
  [0, 1, 'Affitto', 'Canone locale settembre', 1200, 'contratto-affitto.pdf'],
  [0, 4, 'Forniture', 'Aghi e cartucce', 340, 'ddt-forniture-91.pdf'],
  [0, 9, 'Utenze', 'Energia elettrica', 185, 'bolletta-enel-09.pdf'],
  [0, 13, 'Marketing', 'Campagna social settembre', 250, null],
  [0, 17, 'Pulizie', 'Servizio pulizie mensile', 160, null],
  [0, 21, 'Stipendi', 'Compenso collaboratore', 900, null],
  [0, 27, 'Tasse', 'Acconto IVA trimestrale', 740, 'f24-settembre.pdf'],
  [0, 28, 'Altro', 'Manutenzione poltrona', 90, null],
  [-1, 1, 'Affitto', 'Canone locale agosto', 1200, null],
  [-1, 6, 'Forniture', 'Inchiostri professionali', 520, 'ddt-forniture-88.pdf'],
  [-1, 11, 'Utenze', 'Acqua e rifiuti', 95, null],
  [-1, 15, 'Marketing', 'Stampa volantini', 130, null],
  [-1, 23, 'Stipendi', 'Compenso apprendista', 600, null],
  [-2, 1, 'Affitto', 'Canone locale luglio', 1200, null],
  [-2, 14, 'Tasse', 'Contributi INPS', 480, 'f24-luglio.pdf'],
];

async function main(): Promise<void> {
  const artisti = await prisma.staff.findMany({ where: { deletedAt: null }, orderBy: { id: 'asc' } });
  const clienti = await prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { id: 'asc' } });
  const crema = await prisma.creamTattoo.findFirst({ where: { deletedAt: null } });
  const affittuario = artisti.find((a) => a.isRentPayee);

  if (!artisti.length || !clienti.length) {
    console.error('Servono staff e clienti: esegui prima "npm run db:seed" e "npm run db:seed:demo".');
    return;
  }

  // ---- Transazioni: ogni categoria, entrate e uscite, su tre mesi ----
  let nTx = 0;
  const righe: Array<[TransactionType, (typeof ENTRATE)[number]]> = [
    ...ENTRATE.map((r) => ['ENTRATA' as TransactionType, r] as [TransactionType, (typeof ENTRATE)[number]]),
    ...USCITE.map((r) => ['USCITA' as TransactionType, r] as [TransactionType, (typeof ENTRATE)[number]]),
  ];
  for (const [type, [mese, g, category, description, amount, allegato]] of righe) {
    const esiste = await prisma.transaction.findFirst({ where: { description, deletedAt: null } });
    if (esiste) continue;
    await prisma.transaction.create({
      data: {
        type,
        category,
        description,
        amount: new Prisma.Decimal(amount),
        date: giorno(mese, g),
        attachmentUrl: allegato,
      },
    });
    nTx++;
  }
  console.log(`✅ Transazioni: ${nTx} nuove (categorie entrata: ${CATEGORIE_ENTRATA.length}, uscita: ${CATEGORIE_USCITA.length})`);

  // ---- Entrate libere ----
  const entrateLibere = [
    ['Mancia cliente abituale', 40],
    ['Vendita gadget studio', 65],
    ['Noleggio postazione giornaliero', 120],
    ['Rimborso spese trasferta convention', 210],
  ] as const;
  let nEl = 0;
  for (const [name, amount] of entrateLibere) {
    if (await prisma.entrataLibera.findFirst({ where: { name, deletedAt: null } })) continue;
    await prisma.entrataLibera.create({ data: { name, amount: new Prisma.Decimal(amount) } });
    nEl++;
  }
  console.log(`✅ Entrate libere: ${nEl} nuove`);

  // ---- Spese libere ----
  const speseLibere = [
    ['Caffè e bevande per clienti', 35],
    ['Parcheggio convention Milano', 48],
    ['Cancelleria e stampe', 22],
    ['Piccola manutenzione insegna', 95],
    ['Abbonamento software gestione immagini', 29],
  ] as const;
  let nSl = 0;
  for (const [name, price] of speseLibere) {
    if (await prisma.spesaLibera.findFirst({ where: { name, deletedAt: null } })) continue;
    await prisma.spesaLibera.create({ data: { name, price: new Prisma.Decimal(price) } });
    nSl++;
  }
  console.log(`✅ Spese libere: ${nSl} nuove`);

  // ---- Vendite crema ----
  let nCs = 0;
  if (crema) {
    const esistenti = await prisma.creamSale.count({ where: { deletedAt: null } });
    if (esistenti === 0) {
      const vendite = [
        [0, 5, 2], [0, 12, 1], [0, 20, 3],
        [-1, 9, 1], [-1, 18, 2],
        [-2, 14, 1],
      ] as const;
      for (let i = 0; i < vendite.length; i++) {
        const [mese, g, quantity] = vendite[i];
        await prisma.creamSale.create({
          data: {
            creamId: crema.id,
            artistId: artisti[i % artisti.length].id,
            quantity,
            soldAt: giorno(mese, g, 15),
          },
        });
        nCs++;
      }
    }
  }
  console.log(`✅ Vendite crema: ${nCs} nuove`);

  // ---- Prenotazioni con acconto (alimentano la pagina Acconti) ----
  const conAcconto = [
    [0, 5, 14, 600, 150], [0, 16, 11, 900, 300], [0, 24, 16, 450, 100],
    [-1, 10, 10, 750, 200], [-1, 21, 15, 520, 120],
  ] as const;
  let nAcc = 0;
  for (let i = 0; i < conAcconto.length; i++) {
    const [mese, g, ora, price, deposit] = conAcconto[i];
    const date = giorno(mese, g, ora);
    const artista = artisti[i % artisti.length];
    if (await prisma.booking.findFirst({ where: { date, artistId: artista.id, deletedAt: null } })) continue;
    await prisma.booking.create({
      data: {
        customerId: clienti[i % clienti.length].id,
        artistId: artista.id,
        date,
        duration: 120,
        status: 'CONFERMATO',
        price: new Prisma.Decimal(price),
        deposit: new Prisma.Decimal(deposit),
        notes: 'Prenotazione di prova con acconto',
        formData: { percentualeMode: '50', artistPrice: price / 2 },
      },
    });
    nAcc++;
  }
  console.log(`✅ Prenotazioni con acconto: ${nAcc} nuove`);

  // ---- Prenotazioni dell'artista in affitto (alimentano la pagina Affitti) ----
  let nAff = 0;
  if (affittuario) {
    const sedute = [[0, 6, 9], [0, 19, 12], [-1, 13, 17]] as const;
    for (const [mese, g, ora] of sedute) {
      const date = giorno(mese, g, ora);
      if (await prisma.booking.findFirst({ where: { date, artistId: affittuario.id, deletedAt: null } })) continue;
      await prisma.booking.create({
        data: {
          customerId: clienti[nAff % clienti.length].id,
          artistId: affittuario.id,
          date,
          duration: 180,
          status: 'COMPLETATO',
          price: new Prisma.Decimal(0),
          notes: 'Seduta in affitto postazione',
          formData: { percentualeMode: '100', artistPrice: 0 },
        },
      });
      nAff++;
    }
  }
  console.log(`✅ Sedute affitto postazione: ${nAff} nuove${affittuario ? ` (${affittuario.name})` : ''}`);

  // ---- Riepilogo ----
  const [tx, el, sl, cs, bk] = await Promise.all([
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.entrataLibera.count({ where: { deletedAt: null } }),
    prisma.spesaLibera.count({ where: { deletedAt: null } }),
    prisma.creamSale.count({ where: { deletedAt: null } }),
    prisma.booking.count({ where: { deletedAt: null } }),
  ]);
  const somme = await prisma.transaction.groupBy({
    by: ['type'],
    where: { deletedAt: null },
    _sum: { amount: true },
  });
  const entrate = somme.find((s) => s.type === 'ENTRATA')?._sum.amount ?? new Prisma.Decimal(0);
  const uscite = somme.find((s) => s.type === 'USCITA')?._sum.amount ?? new Prisma.Decimal(0);

  console.log('\n--- Totali a database ---');
  console.log(`transazioni ${tx} | entrate libere ${el} | spese libere ${sl} | vendite crema ${cs} | prenotazioni ${bk}`);
  console.log(`entrate € ${entrate} | uscite € ${uscite} | saldo € ${Number(entrate) - Number(uscite)}`);
}

main()
  .catch((e) => {
    console.error('Errore:', e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
