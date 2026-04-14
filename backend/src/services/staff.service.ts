import { StaffRepository } from '../repositories/staff.repository';
import { validate } from '../utils/validators';
import { createStaffSchema } from '../schemas/staff';

const repository = new StaffRepository();

export class StaffService {
  async getAll() {
    return repository.findAll();
  }

  async create(body: unknown) {
    const data = validate(createStaffSchema, body);
    return repository.create(data);
  }

  async delete(id: string) {
    return repository.delete(id);
  }
}
