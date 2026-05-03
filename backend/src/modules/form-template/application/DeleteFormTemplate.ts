import { IFormTemplateRepository } from '../contracts/IFormTemplateRepository';

export class DeleteFormTemplate {
  constructor(private formTemplateRepository: IFormTemplateRepository) {}

  async execute(id: number): Promise<void> {
    return this.formTemplateRepository.delete(id);
  }
}
