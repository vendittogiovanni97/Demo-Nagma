import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { asyncHandler } from '../utils/async-handler';

const service = new CustomerService();

export class CustomerController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await service.getAllCustomers(search, page, limit);
    res.json(data);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getCustomerDetails(String(req.params.id));
    res.json(data);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getCustomerSummary(String(req.params.id));
    res.json(data);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.createCustomer(req.body);
    res.status(201).json(data);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.updateCustomer(String(req.params.id), req.body);
    res.json(data);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteCustomer(String(req.params.id));
    res.status(204).send();
  });
}
