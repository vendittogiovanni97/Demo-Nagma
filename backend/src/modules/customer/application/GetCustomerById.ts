import { ICustomerRepository } from '../contracts/ICustomerRepository';
import { Customer } from '../domain/Customer';

export class GetCustomerById {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: number): Promise<Customer | null> {
    return this.customerRepository.findById(id);
  }
}
