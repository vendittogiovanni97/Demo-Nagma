import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';

const service = new CustomerService();

export class CustomerController {
  getAll = async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const data = await service.getAllCustomers(search, page, limit);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await service.getCustomerDetails(String(req.params.id));
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = await service.createCustomer(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = await service.updateCustomer(String(req.params.id), req.body);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await service.deleteCustomer(String(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };
}
