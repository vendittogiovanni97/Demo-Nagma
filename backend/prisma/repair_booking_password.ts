/**
 * Riparazione una-tantum della password di sblocco bilanci / modifica prenotazioni.
 *
 * Fino alla v2.0.11 la verifica riconosceva come cifrata solo una password che
 * iniziasse per $2b$. Sui database creati con la v1, dove bcryptjs 2.x produceva
 * il prefisso $2a$, il valore veniva scambiato per testo in chiaro e cifrato una
 * seconda volta, sovrascrivendo l'originale in modo irreversibile.
 *
 * Non è possibile distinguere una password danneggiata da una cambiata di
 * proposito: entrambe sono un hash dall'aspetto identico. Per questo la
 * riparazione avviene una volta sola per database, tracciata da un marcatore in
 * `configs`, e non tocca più nulla nelle esecuzioni successive.
 *
 * Scrive esclusivamente `client_configs.bookingUpdatePassword` e il marcatore.
 */

import 'dotenv/config';

import fs from 'fs';
import path from 'path';

import bcrypt from 'bcryptjs';

import prisma from '../src/core/shared/utils/prisma';
import { config } from '../src/core/config/env';

const MARCATORE = 'REPAIR_BOOKING_PASSWORD_2A_PREFIX';
const SEED_PROFILE = process.env.SEED_PROFILE || 'nagma';

async function main(): Promise<void> {
  const gia = await prisma.config.findUnique({ where: { paramsKey: MARCATORE } });
  if (gia) return;

  const dataPath = path.resolve(__dirname, `seed-data/${SEED_PROFILE}.json`);
  if (!fs.existsSync(dataPath)) {
    console.log(`⏭️  Profilo seed "${SEED_PROFILE}" non trovato: riparazione password saltata.`);
    return;
  }

  const seed = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const password: string | undefined = seed?.clientConfig?.bookingUpdatePassword;
  if (!password) {
    console.log('⏭️  Password non presente nel profilo seed: riparazione saltata.');
    return;
  }

  const clientConfig = await prisma.clientConfig.findFirst();
  if (!clientConfig) {
    console.log('⏭️  Nessuna configurazione cliente presente: riparazione saltata.');
    return;
  }

  const hashed = await bcrypt.hash(password, config.bcryptSaltRounds);

  await prisma.$transaction([
    prisma.clientConfig.update({
      where: { id: clientConfig.id },
      data: { bookingUpdatePassword: hashed },
    }),
    prisma.config.create({
      data: { paramsKey: MARCATORE, value: new Date().toISOString() },
    }),
  ]);

  console.log('🔑 Password di sblocco bilanci ripristinata.');
}

main()
  .catch((e) => {
    // Una riparazione fallita non deve impedire l'aggiornamento del gestionale.
    console.log(`⏭️  Riparazione password non eseguita: ${e instanceof Error ? e.message : String(e)}`);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
