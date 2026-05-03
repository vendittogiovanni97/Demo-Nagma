import { Request, Response } from 'express';
import { CreateCustomer } from '../application/CreateCustomer';
import { ListCustomers } from '../application/ListCustomers';
import { GetCustomerById } from '../application/GetCustomerById';
import { GetCustomerSummary } from '../application/GetCustomerSummary';
import { UpdateCustomer } from '../application/UpdateCustomer';
import { DeleteCustomer } from '../application/DeleteCustomer';
import { validate } from '../../../shared/utils/validation';
import { createCustomerSchema, updateCustomerSchema } from './customer.schemas';
import { parsePageQuery } from '../../../shared/utils/date-utils';
import { parseId } from '../../../shared/utils/parse-id';
import { AppError } from '../../../shared/errors/AppError';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class CustomerController {
  constructor(
    private listCustomers: ListCustomers,
    private createCustomer: CreateCustomer,
    private getCustomerById: GetCustomerById,
    private getCustomerSummary: GetCustomerSummary,
    private updateCustomer: UpdateCustomer,
    private deleteCustomer: DeleteCustomer
  ) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parsePageQuery(req.query);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    
    const result = await this.listCustomers.execute({ search, page, limit, startDate, endDate });
    res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const customer = await this.getCustomerById.execute(parseId(req.params.id));
    if (!customer) throw new AppError('Cliente non trovato.', 404);
    res.json(customer.toJSON());
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await this.getCustomerSummary.execute(parseId(req.params.id));
    if (!summary) throw new AppError('Cliente non trovato.', 404);
    res.json(summary);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createCustomerSchema, req.body);
    const result = await this.createCustomer.execute({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || undefined,
      notes: data.notes,
    });
    res.status(201).json(result.toJSON());
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(updateCustomerSchema, req.body);
    const result = await this.updateCustomer.execute(parseId(req.params.id), {
      ...data,
      email: data.email || undefined,
    });
    res.json(result.toJSON());
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteCustomer.execute(parseId(req.params.id));
    res.status(204).send();
  });
}
