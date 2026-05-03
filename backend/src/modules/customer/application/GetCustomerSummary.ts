import { ICustomerRepository } from '../contracts/ICustomerRepository';

export class GetCustomerSummary {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: number): Promise<any> {
    return this.customerRepository.getSummary(id);
  }
}
