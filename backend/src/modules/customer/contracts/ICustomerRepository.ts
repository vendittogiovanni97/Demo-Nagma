import { Customer } from '../domain/Customer';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface CustomerFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ICustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findById(id: number): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  findAllPaged(filters: CustomerFilters): Promise<IPaginatedResponse<Customer>>;
  update(id: number, data: Partial<Customer>): Promise<Customer>;
  delete(id: number): Promise<void>;
  softDelete(id: number): Promise<void>;
  getSummary(id: number): Promise<any>; // Using any for now, can be refined later
}
