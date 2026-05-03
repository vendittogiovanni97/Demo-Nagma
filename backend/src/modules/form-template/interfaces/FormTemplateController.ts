import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { ListFormTemplates } from '../application/ListFormTemplates';
import { GetFormTemplateById } from '../application/GetFormTemplateById';
import { CreateFormTemplate } from '../application/CreateFormTemplate';
import { UpdateFormTemplate } from '../application/UpdateFormTemplate';
import { DeleteFormTemplate } from '../application/DeleteFormTemplate';
import { validate } from '../../../shared/utils/validation';
import { createFormTemplateSchema, updateFormTemplateSchema } from './form-template.schemas';
import { parseId } from '../../../shared/utils/parse-id';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class FormTemplateController {
  constructor(
    private listFormTemplates: ListFormTemplates,
    private getFormTemplateById: GetFormTemplateById,
    private createFormTemplate: CreateFormTemplate,
    private updateFormTemplate: UpdateFormTemplate,
    private deleteFormTemplate: DeleteFormTemplate
  ) {}

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };
    const result = await this.listFormTemplates.execute(filters);
    res.json(result.map(t => t.toJSON()));
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.getFormTemplateById.execute(parseId(req.params.id));
    res.json(result.toJSON());
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(createFormTemplateSchema, req.body);
    const result = await this.createFormTemplate.execute(data);
    res.status(201).json(result.toJSON());
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(updateFormTemplateSchema, req.body);
    const result = await this.updateFormTemplate.execute(parseId(req.params.id), data);
    res.json(result.toJSON());
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.deleteFormTemplate.execute(parseId(req.params.id));
    res.status(204).send();
  });
}
