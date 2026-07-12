import { handleSearch, handleGetById, handleCreate, handleUpdate, handleDelete } from '../../../core/utils/handler';
import { FormTemplateService } from '../services/formTemplateService';
import { createFormTemplateSchema, updateFormTemplateSchema } from './form-template.schemas';

export class FormTemplateController {
  constructor(private readonly formTemplateService: FormTemplateService) {}

  search = handleSearch(async (query) => {
    const result = await this.formTemplateService.findAll({
      startDate: query.startDate as string | undefined,
      endDate: query.endDate as string | undefined,
    });
    return { data: result, total: result.length, page: 1, limit: result.length, totalPages: 1 };
  });

  getById = handleGetById(async (id) => this.formTemplateService.findById(id));

  create = handleCreate(async (data) => this.formTemplateService.create(data), createFormTemplateSchema);

  update = handleUpdate(async (id, data) => this.formTemplateService.update(id, data), updateFormTemplateSchema);

  delete = handleDelete(async (id) => this.formTemplateService.delete(id));
}
