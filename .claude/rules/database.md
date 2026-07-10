# Regole Database e Migration — Demo Nagma

## REGOLA ASSOLUTA: Mai `prisma db push`
```bash
# ❌ VIETATO — non usare mai
prisma db push

# ✅ CORRETTO — sempre migrations
cd backend && npm run db:migrate    # sviluppo (prisma migrate dev)
cd backend && npm run db:migrate:prod  # produzione (prisma migrate deploy)
```

## Workflow Migration

### 1. Modifiche allo schema
```bash
# Modifica schema in backend/prisma/schema.prisma
cd backend && npm run db:migrate    # crea + applica migration
# Il client Prisma si rigenera automaticamente (postinstall)
```

### 2. Seed
```bash
cd backend && npm run db:seed       # idempotente — sicuro da rieseguire
```

Il seed crea: super admin, admin, config di sistema, template WhatsApp, template form, prodotto crema, staff + turni.

### 3. Reset (ATTENZIONE)
```bash
cd backend && npm run db:reset      # DISTRUTTIVO: cancella tutto e ricrea
```
Mai usare su database di produzione o con dati reali.

## Schema Prisma
File singolo: `backend/prisma/schema.prisma`. Non suddiviso in multi-file (a differenza di platform-starter).

## Soft Delete
Le tabelle con `deletedAt` (User, Staff, Customer, Booking, Transaction) non devono mai avere delete fisici.
Tutte le query di lettura devono filtrare `deletedAt: null`:
```typescript
where: { deletedAt: null, ...otherFilters }
```
