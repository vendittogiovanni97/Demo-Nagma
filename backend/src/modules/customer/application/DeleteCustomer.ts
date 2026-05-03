import { ICustomerRepository } from '../contracts/ICustomerRepository';

export class DeleteCustomer {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: number): Promise<void> {
    return this.customerRepository.softDelete(id);
  }
}
