import { Request, Response } from 'express';
import { CustomerRepository } from '../repositories/customer.repository';
import { validate, createCustomerSchema, updateCustomerSchema } from '../schemas';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/AppError';
import { parsePageQuery } from '../utils/date-utils';
import { parseId } from '../utils/parse-id';

const repo = new CustomerRepository();

export class CustomerController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parsePageQuery(req.query);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    res.json(await repo.findAllPaged(search, page, limit, startDate, endDate));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const customer = await repo.findById(parseId(req.params.id));
    if (!customer) throw new AppError('Cliente non trovato.', 404);
    res.json(customer);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await repo.getCustomerSummary(parseId(req.params.id));
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
    res.json(await repo.update(parseId(req.params.id), {
      ...data,
      email: data.email || undefined,
    }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await repo.softDelete(parseId(req.params.id));
    res.status(204).send();
  });
}
