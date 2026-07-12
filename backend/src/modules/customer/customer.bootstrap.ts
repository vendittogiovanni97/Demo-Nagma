import { container } from '../../core/container';
import { CustomerService } from './services/customerService';
import { CustomerController } from './controllers/customer.controller';

export function bootstrapCustomer(): void {
  const customerService = new CustomerService();
  const customerController = new CustomerController(customerService);
  container.register(CustomerService, customerService);
  container.register(CustomerController, customerController);
}
