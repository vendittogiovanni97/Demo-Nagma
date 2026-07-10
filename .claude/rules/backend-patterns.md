# Regole Pattern Backend — Demo Nagma

## Clean Architecture (OBBLIGATORIO per tutti i moduli)
Ogni modulo deve seguire questa struttura — niente strutture flat con `controllers/services/`:
```
modules/{nome}/
  contracts/       # interfacce + DTO (IRepository, DTOs)
  application/     # use case (una classe per operazione business)
  infrastructure/  # implementazione Prisma del repository
  domain/          # entità di dominio
  interfaces/      # controller, routes Express, schema Zod
```

## DI Container (`src/container/index.ts`)
Tutta l'istanziazione è centralizzata. Mai `new Service()` nei controller o nelle route:
```typescript
// ✅ corretto — in container/index.ts
const repository = new PrismaXxxRepository();
const createXxx = new CreateXxx(repository);
const controller = new XxxController(createXxx, ...);
export const container = { ...existingControllers, xxxController };

// ❌ vietato — nei file route
const service = new XxxService();
```

## Use Case Pattern
Ogni operazione business è una classe separata con un unico metodo `execute()`:
```typescript
// ✅ corretto
export class CreateBooking {
  constructor(private repository: IBookingRepository) {}
  async execute(data: CreateBookingDTO): Promise<Booking> { ... }
}

// ❌ vietato — service con 10 metodi
export class BookingService {
  create() { ... }
  update() { ... }
  delete() { ... }
}
```

## Schema Zod nelle interfaces/
Ogni modulo deve avere un file `{nome}.schemas.ts` nelle `interfaces/` con gli schema Zod per la validazione.
Usare sempre `validate(schema, data)` da `shared/utils/validation.ts`.

## Error Handling
Usare sempre `AppError` da `shared/errors/AppError.ts`. Mai throw di Error generici nei controller:
```typescript
// ✅ corretto
throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente non trovato');

// ❌ vietato
throw new Error('Cliente non trovato');
```

## Async Handler
Ogni route handler async deve essere wrappato con `asyncHandler()`:
```typescript
router.get('/', asyncHandler(async (req, res) => { ... }));
```

## Soft Delete
Per le entità che supportano soft delete (User, Staff, Customer, Booking, Transaction):
```typescript
// ✅ corretto — soft delete
await prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });

// ❌ vietato — delete fisico su entità con deletedAt
await prisma.customer.delete({ where: { id } });
```
