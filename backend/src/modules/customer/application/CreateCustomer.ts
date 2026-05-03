import { ICustomerRepository } from '../contracts/ICustomerRepository';
import { CreateCustomerDTO } from '../contracts/CustomerDTOs';
import { Customer } from '../domain/Customer';

export class CreateCustomer {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(data: CreateCustomerDTO): Promise<Customer> {
    const customer = new Customer({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    });

    return this.customerRepository.save(customer);
  }
}
