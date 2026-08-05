# Audit vincoli di unicità (Prisma / PostgreSQL)

> Verifica dei vincoli di unicità a livello DB. Aggiornato: 2026-08-05.

## Sintesi

L'unicità è **coperta meglio** di quanto suggerisse la conta grezza dei soli
`@@unique` di blocco: molti vincoli sono a livello di campo (`@unique`). Nessuna
azione urgente; una sola scelta di design da confermare (email cliente).

## Vincoli presenti

| Modello | Campo/i | Tipo |
|---|---|---|
| `User` | `email` | `@unique` |
| `Config` | `paramsKey` | `@unique` |
| `BookingPlacement` | `bookingId` | `@unique` (1:1 con Booking) |
| `UserPreference` | `userId` | `@unique` (1:1 con User) |
| `CustomField` | `entityType, fieldName, clientId` | `@@unique` |

## Punti da confermare (design, non bug)

1. **`Customer.email` non è unico** (campo nullable, solo `@@index`). Per un CRM è
   spesso **intenzionale** (clienti senza email, o omonimie), ma se il business
   vuole impedire due clienti *attivi* con la stessa email va aggiunto un vincolo.
   Attenzione: un `@unique` classico confligge con il **soft-delete** (`deletedAt`),
   perché impedirebbe di ricreare un cliente con l'email di uno cancellato.
   La soluzione corretta è un **indice unico parziale** (solo sui non cancellati),
   che Prisma non esprime nello schema: va fatto con una migrazione SQL raw.

   Bozza (NON applicata — valutare col business):
   ```sql
   -- Unicità email solo tra i clienti attivi (deletedAt IS NULL)
   CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
     "Customer_email_active_unique"
     ON "Customer" ("email")
     WHERE "deletedAt" IS NULL AND "email" IS NOT NULL;
   ```

2. **`Staff.email` / `WhatsAppTemplate.name`**: verificare se serve unicità (es.
   nome template univoco per client). Stesso ragionamento soft-delete del punto 1.

## Raccomandazioni

- Confermare col business la regola sull'email cliente; se serve, applicare
  l'indice parziale sopra tramite una migrazione dedicata.
- Per ogni futuro `@unique` su tabelle con `deletedAt`, preferire l'indice unico
  **parziale** (`WHERE deletedAt IS NULL`) per non rompere il soft-delete.
- Il `globalErrorHandler` già mappa la violazione di unicità (Prisma `P2002`) su
  HTTP 409 con messaggio chiaro: nessuna modifica necessaria lato gestione errori.
