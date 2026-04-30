import { Request, Response } from 'express';
import { createCustomerSchema, updateCustomerSchema, validate } from '../schemas';
import { CustomerService } from '../services/customer.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/async-handler';
import { parsePageQuery } from '../utils/date-utils';
import { parseId } from '../utils/parse-id';

const customerService = new CustomerService();

export class CustomerController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parsePageQuery(req.query);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    res.json(await customerService.findAllPaged(search, page, limit, startDate, endDate));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.findById(parseId(req.params.id));
    if (!customer) throw new AppError('Cliente non trovato.', 404);
    res.json(customer);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await customerService.getCustomerSummary(parseId(req.params.id));
    if (!summary) throw new AppError('Cliente non trovato.', 404);
    res.json(summary);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createCustomerSchema, req.body);
    res.status(201).json(await customerService.create({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || undefined,
      notes: data.notes,
    }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(updateCustomerSchema, req.body);
    res.json(await customerService.update(parseId(req.params.id), {
      ...data,
      email: data.email || undefined,
    }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await customerService.softDelete(parseId(req.params.id));
    res.status(204).send();
  });
}
