import { CustomerRepository } from '../repositories/customer.repository';
import { Prisma } from '@prisma/client';

export class CustomerService {
  private repository: CustomerRepository;

  constructor() {
    this.repository = new CustomerRepository();
  }

  async getAllCustomers(searchStr?: string) {
    if (searchStr && searchStr.trim() !== '') {
      return this.repository.search(searchStr.trim());
    }
    return this.repository.findAll();
  }

  async getCustomerDetails(id: string) {
    const customer = await this.repository.findById(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  async createCustomer(data: { firstName: string; lastName: string; phone: string; email?: string; notes?: string }) {
    if (!data.firstName || !data.lastName || !data.phone) {
      throw new Error('First Name, Last Name, and Phone are required.');
    }
    return this.repository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      notes: data.notes
    });
  }

  async updateCustomer(id: string, data: Partial<Prisma.CustomerUpdateInput>) {
    return this.repository.update(id, data);
  }

  async deleteCustomer(id: string) {
    return this.repository.softDelete(id);
  }
}
