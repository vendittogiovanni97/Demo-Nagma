import { CustomerRepository } from '../repositories/customer.repository';
import { AppError } from '../utils/AppError';
import { validate, CreateCustomerSchema, UpdateCustomerSchema } from '../utils/validators';

const repository = new CustomerRepository();

export class CustomerService {
  async getAllCustomers(search?: string, page = 1, limit = 20) {
    return repository.findAllPaged(search?.trim(), page, limit);
  }

  async getCustomerDetails(id: string) {
    const customer = await repository.findById(id);
    if (!customer) throw new AppError('Cliente non trovato.', 404);
    return customer;
  }

  async createCustomer(body: unknown) {
    const data = validate(CreateCustomerSchema, body);
    return repository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || undefined,
      notes: data.notes,
    });
  }

  async updateCustomer(id: string, body: unknown) {
    const data = validate(UpdateCustomerSchema, body);
    return repository.update(id, {
      ...data,
      email: data.email || undefined,
    });
  }

  async deleteCustomer(id: string) {
    return repository.softDelete(id);
  }
}
