import { ICustomerRepository } from '../contracts/ICustomerRepository';
import { UpdateCustomerDTO } from '../contracts/CustomerDTOs';
import { Customer } from '../domain/Customer';

export class UpdateCustomer {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: number, data: UpdateCustomerDTO): Promise<Customer> {
    return this.customerRepository.update(id, data as any);
  }
}
