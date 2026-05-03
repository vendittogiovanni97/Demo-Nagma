import { IFormTemplateRepository, FormTemplateFilters } from '../contracts/IFormTemplateRepository';
import { FormTemplate } from '../domain/FormTemplate';

export class ListFormTemplates {
  constructor(private formTemplateRepository: IFormTemplateRepository) {}

  async execute(filters: FormTemplateFilters): Promise<FormTemplate[]> {
    return this.formTemplateRepository.findAll(filters);
  }
}
