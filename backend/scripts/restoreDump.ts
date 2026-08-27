import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import prisma, { closeDatabase } from '../src/core/shared/utils/prisma';
import { logger } from '../src/core/shared/utils/logger';

interface BackupMetadata {
  version: string;
  timestamp: string;
  databaseName: string;
  totalCollections: number;
  totalDocuments: number;
}

interface BackupDumpPayload {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

async function restoreDump() {
  const dumpFilePath = process.argv[2];

  if (!dumpFilePath) {
    console.error('❌ Specificare il percorso del file .dump da ripristinare.');
    console.error('Esempio d\'uso: npm run db:restore backups/backup_database_2026-08-27_17-09.dump');
    process.exit(1);
  }

  const absolutePath = path.resolve(dumpFilePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File di backup non trovato nel percorso: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`🔍 Lettura file di dump: ${absolutePath}...`);
  const rawContent = fs.readFileSync(absolutePath, 'utf-8');
  let dumpPayload: BackupDumpPayload;

  try {
    dumpPayload = JSON.parse(rawContent);
  } catch (parseError) {
    console.error('❌ Il file di dump fornito non contiene un JSON valido.');
    process.exit(1);
  }

  const { metadata, data } = dumpPayload;

  if (!metadata || !metadata.version || !data || typeof data !== 'object') {
    console.error('❌ File di dump non valido: metadati o struttura dati mancanti.');
    process.exit(1);
  }

  console.log('--------------------------------------------------');
  console.log('📋 METADATI BACKUP RILEVATI:');
  console.log(`   • Versione:     ${metadata.version}`);
  console.log(`   • Timestamp:    ${metadata.timestamp}`);
  console.log(`   • Database:     ${metadata.databaseName}`);
  console.log(`   • Collezioni:   ${metadata.totalCollections}`);
  console.log(`   • Documenti:    ${metadata.totalDocuments}`);
  console.log('--------------------------------------------------');

  // Ordine inverso di eliminazione per gestire le foreign key / relazioni
  const restoreOrder = [
    'bookingPlacement',
    'attachment',
    'customField',
    'whatsAppMessageLog',
    'bookingHistory',
    'transactionHistory',
    'creamSale',
    'shift',
    'booking',
    'transaction',
    'creamTattoo',
    'customer',
    'staff',
    'spesaLibera',
    'entrataLibera',
    'formTemplate',
    'whatsAppTemplate',
    'config',
    'clientConfig',
    'userPreference',
    'savedView',
    'user',
  ];

  console.log('🔄 Avvio ripristino del database...');

  try {
    await prisma.$connect();

    // 1. Svuotamento collezioni in ordine inverso di dipendenza
    console.log('🧹 Svuotamento collezioni esistenti...');
    for (const modelKey of restoreOrder) {
      const clientModel = (prisma as any)[modelKey];
      if (clientModel && typeof clientModel.deleteMany === 'function') {
        try {
          await clientModel.deleteMany();
        } catch (delErr) {
          logger.warn(`[RestoreTool] Warning durante svuotamento ${modelKey}`, { error: delErr });
        }
      }
    }

    // 2. Ripopolamento collezioni in ordine diretto
    const insertOrder = [...restoreOrder].reverse();
    let restoredDocsCount = 0;
    let restoredCollectionsCount = 0;

    for (const modelKey of insertOrder) {
      const records = data[modelKey];
      const clientModel = (prisma as any)[modelKey];

      if (records && Array.isArray(records) && records.length > 0 && clientModel) {
        console.log(`📥 Ripristino collezione '${modelKey}' (${records.length} record)...`);

        for (const record of records) {
          // Converti campi data ISO in oggetti Date se necessario per Prisma
          const processedRecord = { ...record };
          for (const key of Object.keys(processedRecord)) {
            const value = processedRecord[key];
            if (
              typeof value === 'string' &&
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
            ) {
              processedRecord[key] = new Date(value);
            }
          }

          try {
            await clientModel.create({ data: processedRecord });
            restoredDocsCount += 1;
          } catch (createErr) {
            logger.warn(`[RestoreTool] Impossibile inserire record in ${modelKey}`, { record, error: createErr });
          }
        }

        restoredCollectionsCount += 1;
      }
    }

    console.log('--------------------------------------------------');
    console.log('✅ RIPRISTINO DATABASE COMPLETATO CON SUCCESSO!');
    console.log(`   • Collezioni ripristinate: ${restoredCollectionsCount}`);
    console.log(`   • Documenti ripristinati:  ${restoredDocsCount}`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ Errore durante il ripristino del database:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

void restoreDump();
