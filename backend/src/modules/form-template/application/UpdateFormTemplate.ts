import { IFormTemplateRepository } from '../contracts/IFormTemplateRepository';
import { UpdateFormTemplateDTO } from '../contracts/FormTemplateDTOs';
import { FormTemplate } from '../domain/FormTemplate';

export class UpdateFormTemplate {
  constructor(private formTemplateRepository: IFormTemplateRepository) {}

  async execute(id: number, data: UpdateFormTemplateDTO): Promise<FormTemplate> {
    return this.formTemplateRepository.update(id, data);
  }
}
