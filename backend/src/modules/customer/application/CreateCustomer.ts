import { ICustomerRepository } from '../contracts/ICustomerRepository';
import { CreateCustomerDTO } from '../contracts/CustomerDTOs';
import { Customer } from '../domain/Customer';

export class CreateCustomer {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(data: CreateCustomerDTO): Promise<Customer> {
    // 1. Controllo per telefono
    const existingByPhone = await this.customerRepository.findByPhone(data.phone);
    if (existingByPhone) {
      throw new Error(`Un cliente con questo numero di telefono (${data.phone}) esiste già.`);
    }

    // 2. Controllo per nome e cognome
    const existingByName = await this.customerRepository.findByName(data.firstName, data.lastName);
    if (existingByName) {
      throw new Error(`Un cliente con nome "${data.firstName} ${data.lastName}" esiste già.`);
    }

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
