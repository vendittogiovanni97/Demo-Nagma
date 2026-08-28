import { Express, Router, RequestHandler } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { handleSearch, handleGetById, handleCreate, handleUpdate, handleDelete } from './handler';

interface CrudHandlers {
  search?: ReturnType<typeof handleSearch>;
  getById?: ReturnType<typeof handleGetById>;
  create?: ReturnType<typeof handleCreate>;
  update?: ReturnType<typeof handleUpdate>;
  delete?: ReturnType<typeof handleDelete>;
}

interface CrudRoutesConfig {
  basePath: string;
  handlers: CrudHandlers;
  middlewares?: {
    search?: RequestHandler[];
    getById?: RequestHandler[];
    create?: RequestHandler[];
    update?: RequestHandler[];
    delete?: RequestHandler[];
  };
  requireAuth?: boolean;
}

export function registerCrudRoutes(app: Express, config: CrudRoutesConfig): void {
  const { basePath, handlers, middlewares = {}, requireAuth = true } = config;
  const router = Router();

  const auth = requireAuth ? [authMiddleware] : [];
  const defaults = { search: auth, getById: auth, create: auth, update: auth, delete: auth };

  if (handlers.search) {
    router.get('/', ...(middlewares.search ?? defaults.search), handlers.search);
  }
  if (handlers.getById) {
    router.get('/:id', ...(middlewares.getById ?? defaults.getById), handlers.getById);
  }
  if (handlers.create) {
    router.post('/', ...(middlewares.create ?? defaults.create), handlers.create);
  }
  if (handlers.update) {
    router.put('/:id', ...(middlewares.update ?? defaults.update), handlers.update);
  }
  if (handlers.delete) {
    router.delete('/:id', ...(middlewares.delete ?? defaults.delete), handlers.delete);
  }

  app.use(basePath, router);
}
