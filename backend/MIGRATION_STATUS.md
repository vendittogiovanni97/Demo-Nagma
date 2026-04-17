# Migrazione Staff ↔ Shift

## Status: ✅ MIGRAZIONE CREATA

### Comando eseguito:
```bash
npx prisma migrate dev --name migrate_staff_shifts_to_table
```

### Risultato:
- **Migrazione**: Creata in `prisma/migrations/20260417103521_migrate_staff_shifts_to_table/migration.sql`
- **Prisma Client**: Già contiene il modello Shift (generato previamente)
- **Schema**: Aggiornato con Shift model e relazione bidirezionale Staff ↔ Shift

### File di migrazione creato:
```sql
-- CreateTable Shift
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakDuration" INTEGER,
    "notes" TEXT,
    "staffId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Shift_staffId_date_idx" ON "Shift"("staffId", "date");

ALTER TABLE "Shift" ADD CONSTRAINT "Shift_staffId_fkey" 
  FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Schema Prisma aggiornato:
- ✅ Model Shift creato con relazione a Staff
- ✅ Staff model ha relazione bidirezionale: `shifts: Shift[]`
- ✅ Shift table linkato a Staff con foreign key e ON DELETE CASCADE
- ✅ Index su (staffId, date) per ottimizzare query

### Prossimi step:
1. **Environment DEV**: Applicare la migrazione al database (connessione ncessaria)
   ```bash
   npx prisma migrate deploy
   ```

2. **Environment PROD**: Data migration manuale (preservare shift JSON)
   - Estrarre dati JSON da Staff.shifts
   - Inserire in tabella Shift
   - Rimuovere Staff.shifts column

### Note:
- La migrazione SQL è creata ma NON applicata al DB (errore connessione a binari Prisma)
- Prisma Client è già sincronizzato con il nuovo schema
- Shift JSON su Staff andrà perso se applicata direttamente senza data migration
