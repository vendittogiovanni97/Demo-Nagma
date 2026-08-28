import { Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../shared/utils/asyncHandler';
import { validate } from '../shared/utils/validation';
import { parseId } from '../shared/utils/parse-id';
import { CustomPaginatedResponse, PaginatedResponse } from '../shared/kernel/pagination';

type SearchFn<T> = (query: Record<string, unknown>) => Promise<PaginatedResponse<T> | CustomPaginatedResponse<T>>;
type GetByIdFn<T> = (id: number) => Promise<T | null>;
type CreateFn<T, R> = (data: T, userId?: number) => Promise<R>;
type UpdateFn<T, R> = (id: number, data: T, userId?: number) => Promise<R>;
type DeleteFn<R> = (id: number, userId?: number) => Promise<R>;

export function handleSearch<T>(fn: SearchFn<T>) {
  return asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await fn(req.query as Record<string, unknown>);
    res.json(result);
  });
}

export function handleGetById<T>(fn: GetByIdFn<T>, notFoundMessage?: string) {
  return asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const result = await fn(id);
    if (!result) {
      return res.status(404).json({ success: false, message: notFoundMessage || 'Risorsa non trovata' });
    }
    res.json({ success: true, data: result });
  });
}

// Il vincolo `Record<string, any>` è voluto: per i route handler senza schema Zod
// il body HTTP non validato passa attraverso il generic T come fallback
// d'inferenza; `unknown` renderebbe il passthrough verso i service non assegnabile.
export function handleCreate<T extends Record<string, any>, R>(fn: CreateFn<T, R>, schema?: ZodSchema<T>) {  // eslint-disable-line @typescript-eslint/no-explicit-any
  return asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = schema ? validate(schema, req.body) : (req.body as T);
    const userId = req.user?.id;
    const result = await fn(data, userId);
    res.status(201).json({ success: true, data: result });
  });
}

export function handleUpdate<T extends Record<string, any>, R>(fn: UpdateFn<T, R>, schema?: ZodSchema<T>) {  // eslint-disable-line @typescript-eslint/no-explicit-any
  return asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseId(req.params.id);
    const data = schema ? validate(schema, req.body) : (req.body as T);
    const userId = req.user?.id;
    const result = await fn(id, data, userId);
    res.json({ success: true, data: result });
  });
}

export function handleDelete<R>(fn: DeleteFn<R>) {
  return asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseId(req.params.id);
    const userId = req.user?.id;
    await fn(id, userId);
    res.status(204).send();
  });
}
