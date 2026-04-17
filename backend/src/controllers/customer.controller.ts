import { Request, Response } from 'express';
import { CustomerRepository } from '../repositories/customer.repository';
import { validate, createCustomerSchema, updateCustomerSchema } from '../schemas';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/AppError';
import { parsePageQuery } from '../utils/date-utils';

const repo = new CustomerRepository();

export class CustomerController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parsePageQuery(req.query);
    res.json(await repo.findAllPaged(search, page, limit));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const customer = await repo.findById(Number(req.params.id));
    if (!customer) throw new AppError('Cliente non trovato.', 404);
    res.json(customer);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await repo.getCustomerSummary(Number(req.params.id));
    if (!summary) throw new AppError('Cliente non trovato.', 404);
    res.json(summary);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createCustomerSchema, req.body);
    res.status(201).json(await repo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || undefined,
      notes: data.notes,
    }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(updateCustomerSchema, req.body);
    res.json(await repo.update(Number(req.params.id), {
      ...data,
      email: data.email || undefined,
    }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await repo.softDelete(Number(req.params.id));
    res.status(204).send();
  });
}
