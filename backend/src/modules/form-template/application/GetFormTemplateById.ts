import { IFormTemplateRepository } from '../contracts/IFormTemplateRepository';
import { FormTemplate } from '../domain/FormTemplate';
import { AppError } from '../../../shared/errors/AppError';

export class GetFormTemplateById {
  constructor(private formTemplateRepository: IFormTemplateRepository) {}

  async execute(id: number): Promise<FormTemplate> {
    const template = await this.formTemplateRepository.findById(id);
    if (!template) throw new AppError('Template non trovato', 404, 'NOT_FOUND');
    return template;
  }
}
