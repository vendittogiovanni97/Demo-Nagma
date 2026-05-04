import { ICustomerRepository } from '../contracts/ICustomerRepository';
import { UpdateCustomerDTO } from '../contracts/CustomerDTOs';
import { Customer } from '../domain/Customer';

export class UpdateCustomer {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: number, data: UpdateCustomerDTO): Promise<Customer> {
    // 1. Se il telefono è cambiato, controlla se appartiene a un altro cliente
    if (data.phone) {
      const existingByPhone = await this.customerRepository.findByPhone(data.phone);
      if (existingByPhone && existingByPhone.id !== id) {
        throw new Error(`Un altro cliente possiede già questo numero di telefono (${data.phone}).`);
      }
    }

    // 2. Se il nome è cambiato, controlla se la coppia nome/cognome collide con un altro cliente
    if (data.firstName || data.lastName) {
      // Dobbiamo recuperare i dati correnti per comporre il nome completo se solo uno dei due è fornito
      const current = await this.customerRepository.findById(id);
      if (current) {
        const newFirstName = data.firstName || current.firstName;
        const newLastName = data.lastName || current.lastName;
        
        const existingByName = await this.customerRepository.findByName(newFirstName, newLastName);
        if (existingByName && existingByName.id !== id) {
          throw new Error(`Un altro cliente si chiama già "${newFirstName} ${newLastName}".`);
        }
      }
    }

    return this.customerRepository.update(id, data as any);
  }
}
