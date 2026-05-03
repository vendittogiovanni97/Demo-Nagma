import { FormTemplate } from '../domain/FormTemplate';

export interface FormTemplateFilters {
  startDate?: string;
  endDate?: string;
}

export interface IFormTemplateRepository {
  findAll(filters: FormTemplateFilters): Promise<FormTemplate[]>;
  findById(id: number): Promise<FormTemplate | null>;
  create(template: FormTemplate): Promise<FormTemplate>;
  update(id: number, data: Partial<FormTemplate>): Promise<FormTemplate>;
  delete(id: number): Promise<void>;
}
