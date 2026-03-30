import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  private service: CustomerService;

  constructor() {
    this.service = new CustomerService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string;
      const customers = await this.service.getAllCustomers(search);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const customer = await this.service.getCustomerDetails(req.params.id as string);
      res.json(customer);
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        res.status(404).json({ status: 'error', message: error.message });
      } else {
        res.status(500).json({ status: 'error', message: error.message });
      }
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const customer = await this.service.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const customer = await this.service.updateCustomer(req.params.id as string, req.body);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.deleteCustomer(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  };
}
