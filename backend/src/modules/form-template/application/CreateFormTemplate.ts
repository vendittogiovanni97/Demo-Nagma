import { IFormTemplateRepository } from '../contracts/IFormTemplateRepository';
import { CreateFormTemplateDTO } from '../contracts/FormTemplateDTOs';
import { FormTemplate } from '../domain/FormTemplate';

export class CreateFormTemplate {
  constructor(private formTemplateRepository: IFormTemplateRepository) {}

  async execute(data: CreateFormTemplateDTO): Promise<FormTemplate> {
    const template = new FormTemplate({
      name: data.name,
      schemaB64: data.schemaB64,
    });
    return this.formTemplateRepository.create(template);
  }
}
