import { Request, Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { ListWhatsAppTemplates } from '../application/ListWhatsAppTemplates';
import { ListWhatsAppLogs } from '../application/ListWhatsAppLogs';
import { CreateWhatsAppTemplate } from '../application/CreateWhatsAppTemplate';
import { UpdateWhatsAppTemplate } from '../application/UpdateWhatsAppTemplate';
import { DeleteWhatsAppTemplate } from '../application/DeleteWhatsAppTemplate';
import { DuplicateWhatsAppTemplate } from '../application/DuplicateWhatsAppTemplate';
import { SendManualWhatsAppMessage } from '../application/SendManualWhatsAppMessage';
import { validate } from '../../../shared/utils/validation';
import { createWhatsAppTemplateSchema, updateWhatsAppTemplateSchema, listWhatsAppLogsSchema, sendWhatsAppMessageSchema } from './whatsapp.schemas';
import { parseId } from '../../../shared/utils/parse-id';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class WhatsAppController {
  constructor(
    private listTemplatesUseCase: ListWhatsAppTemplates,
    private listLogsUseCase: ListWhatsAppLogs,
    private createTemplateUseCase: CreateWhatsAppTemplate,
    private updateTemplateUseCase: UpdateWhatsAppTemplate,
    private deleteTemplateUseCase: DeleteWhatsAppTemplate,
    private duplicateTemplateUseCase: DuplicateWhatsAppTemplate,
    private sendMessageUseCase: SendManualWhatsAppMessage
  ) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      search: req.query.search as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };
    const result = await this.listTemplatesUseCase.execute(filters);
    res.json(result.map(t => t.toJSON()));
  });

  getLogs = asyncHandler(async (req: Request, res: Response) => {
    const rawQuery = req.query as any;
    const filters = validate(listWhatsAppLogsSchema, {
      ...rawQuery,
      page: rawQuery.page ? Number(rawQuery.page) : 1,
      limit: rawQuery.limit ? Number(rawQuery.limit) : 20,
    });
    const result = await this.listLogsUseCase.execute(filters as any);
    res.json({
      ...result,
      data: result.data.map(l => l.toJSON())
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createWhatsAppTemplateSchema, req.body);
    const result = await this.createTemplateUseCase.execute(data as any);
    res.status(201).json(result.toJSON());
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(updateWhatsAppTemplateSchema, req.body);
    const result = await this.updateTemplateUseCase.execute(parseId(req.params.id), data as any);
    res.json(result.toJSON());
  });

  duplicate = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.duplicateTemplateUseCase.execute(parseId(req.params.id));
    res.status(201).json(result.toJSON());
  });

  sendManual = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(sendWhatsAppMessageSchema, req.body);
    const result = await this.sendMessageUseCase.execute(data as any, req.user!.id);
    res.status(201).json({
      ...result,
      log: result.log.toJSON()
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteTemplateUseCase.execute(parseId(req.params.id));
    res.status(204).send();
  });
}
