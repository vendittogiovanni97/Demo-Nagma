import { FormTemplateRepository } from '../repositories/form-template.repository';
import { validate } from '../utils/validators';
import { createFormTemplateSchema, updateFormTemplateSchema } from '../schemas/form-template';
import { AppError } from '../utils/AppError';

const repository = new FormTemplateRepository();

export class FormTemplateService {
  async getAll() {
    return repository.findAll();
  }

  async getById(id: string) {
    const template = await repository.findById(id);
    if (!template) {
      throw new AppError('Template non trovato', 404, 'NOT_FOUND');
    }
    return template;
  }

  async create(body: unknown) {
    const data = validate(createFormTemplateSchema, body);
    return repository.create(data);
  }

  async update(id: string, body: unknown) {
    const data = validate(updateFormTemplateSchema, body);
    const existing = await repository.findById(id);
    if (!existing) {
      throw new AppError('Template non trovato', 404, 'NOT_FOUND');
    }
    return repository.update(id, data);
  }

  async delete(id: string) {
    const existing = await repository.findById(id);
    if (!existing) {
      throw new AppError('Template non trovato', 404, 'NOT_FOUND');
    }
    return repository.delete(id);
  }
}
