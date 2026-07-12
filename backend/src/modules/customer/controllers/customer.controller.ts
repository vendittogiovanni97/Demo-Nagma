import { handleSearch, handleGetById, handleCreate, handleUpdate, handleDelete } from '../../../core/utils/handler';
import { CustomerService } from '../services/customerService';
import { createCustomerSchema, updateCustomerSchema } from './customer.schemas';

export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  search = handleSearch(async (query) => this.customerService.search(query));

  getById = handleGetById(async (id) => this.customerService.getById(id));

  getSummary = handleGetById(async (id) => this.customerService.getSummary(id), 'Cliente non trovato.');

  create = handleCreate(async (data) => this.customerService.create(data), createCustomerSchema);

  update = handleUpdate(async (id, data) => this.customerService.update(id, data), updateCustomerSchema);

  delete = handleDelete(async (id) => this.customerService.delete(id));
}
