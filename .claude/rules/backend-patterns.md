# Regole Pattern Backend — Demo Nagma

## Architettura Modulo (OBBLIGATORIO)
Ogni modulo segue questa struttura — controller/service/routes + bootstrap:
```
modules/{nome}/
  controllers/     # controller Express (usa handler factory)
  services/        # business logic (service class)
  routes/          # registrazione route Express
  {nome}.bootstrap.ts  # registra service + controller nel DI container
```

## DI Container (`src/core/container/`)
Tutta l'istanziazione è nei file `{modulo}.bootstrap.ts`, mai `new Service()` nei controller o nelle route:
```typescript
// ✅ corretto — nel bootstrap
export function bootstrapCustomer(): void {
  const service = new CustomerService();
  const controller = new CustomerController(service);
  container.register(CustomerService, service);
  container.register(CustomerController, controller);
}

// ❌ vietato — nei file route
const service = new CustomerService();
```

Il bootstrap centralizzato in `core/container/bootstrap.ts` chiama tutti i bootstrap dei moduli.

## Handler Factory (OBBLIGATORIO)
Usa sempre le factory da `core/utils/handler.ts`. Mai try/catch manuali nei controller:
```typescript
import { handleSearch, handleGetById, handleCreate, handleUpdate, handleDelete } from '../../core/utils/handler';

// ✅ corretto
search = handleSearch((query) => this.service.search(query));
getById = handleGetById((id) => this.service.getById(id));
create = handleCreate((data, userId) => this.service.create(data, userId));
update = handleUpdate((id, data, userId) => this.service.update(id, data, userId));
remove = handleDelete((id) => this.service.delete(id));

// ❌ vietato — try/catch manuale nei controller
async search(req: Request, res: Response) {
  try { const data = await this.service.search(req.query); res.json(data); }
  catch (e) { res.status(500).json({ error: e.message }); }
}
```

## CRUD Routes Factory
Per route CRUD standard, usa `registerCrudRoutes` da `core/utils/crudRoutes.ts`:
```typescript
import { registerCrudRoutes } from '../../core/utils/crudRoutes';

registerCrudRoutes(router, controller);
```

## Schema Zod
Schemi di validazione nei controller o in file `*.schemas.ts` dedicati.
Usare sempre `validate(schema, data)` da `core/shared/utils/validation.ts`.

## Error Handling
Usare sempre `AppError` da `core/shared/errors/AppError.ts`. Mai throw di Error generici:
```typescript
// ✅ corretto
throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente non trovato');

// ❌ vietato
throw new Error('Cliente non trovato');
```

## Soft Delete
Per le entità che supportano soft delete (User, Staff, Customer, Booking, Transaction):
```typescript
// ✅ corretto — soft delete
await prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });

// ❌ vietato — delete fisico su entità con deletedAt
await prisma.customer.delete({ where: { id } });
```

Tutte le query di lettura devono filtrare `deletedAt: null`.
