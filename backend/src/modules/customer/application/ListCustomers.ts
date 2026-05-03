import { ICustomerRepository, CustomerFilters } from '../contracts/ICustomerRepository';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { Customer } from '../domain/Customer';

export class ListCustomers {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(filters: CustomerFilters): Promise<IPaginatedResponse<Customer>> {
    return this.customerRepository.findAllPaged(filters);
  }
}
