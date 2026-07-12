import { Request, Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { handleCreate, handleUpdate, handleDelete } from '../../../core/utils/handler';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { validate } from '../../../core/shared/utils/validation';
import { parseId } from '../../../core/shared/utils/parse-id';
import { WhatsAppService } from '../services/whatsappService';
import {
  createWhatsAppTemplateSchema,
  updateWhatsAppTemplateSchema,
  sendWhatsAppMessageSchema,
} from './whatsapp.schemas';

export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.whatsappService.getAllTemplates(req.query);
    res.json(result);
  });

  getLogs = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.whatsappService.getLogs(req.query);
    res.json(result);
  });

  create = handleCreate(async (data) => this.whatsappService.createTemplate(data), createWhatsAppTemplateSchema);

  update = handleUpdate(async (id, data) => this.whatsappService.updateTemplate(id, data), updateWhatsAppTemplateSchema);

  duplicate = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.whatsappService.duplicateTemplate(parseId(req.params.id));
    res.status(201).json(result);
  });

  sendManual = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(sendWhatsAppMessageSchema, req.body);
    const result = await this.whatsappService.sendMessage(data, req.user!.id);
    res.status(201).json(result);
  });

  delete = handleDelete(async (id) => this.whatsappService.deleteTemplate(id));
}
