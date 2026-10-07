import { Request, Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { handleCreate, handleUpdate, handleDelete } from '../../../core/utils/handler';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { validate } from '../../../core/shared/utils/validation';
import { parseId } from '../../../core/shared/utils/parse-id';
import { WhatsAppService } from '../services/whatsappService';
import { BirthdayReminderService } from '../services/birthdayReminder.service';
import { BaileysService } from '../services/baileys.service';
import {
  createWhatsAppTemplateSchema,
  updateWhatsAppTemplateSchema,
  sendWhatsAppMessageSchema,
  sendBirthdayGreetingsSchema,
} from './whatsapp.schemas';

export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly birthdayReminderService: BirthdayReminderService,
    private readonly baileysService: BaileysService,
  ) {}

  getConnectionStatus = asyncHandler(async (_req: Request, res: Response) => {
    res.json(this.baileysService.getStatus());
  });

  connectWhatsApp = asyncHandler(async (_req: Request, res: Response) => {
    res.json(await this.baileysService.connect());
  });

  disconnectWhatsApp = asyncHandler(async (_req: Request, res: Response) => {
    await this.baileysService.disconnect();
    res.json({ success: true, message: 'Disconnesso con successo' });
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.whatsappService.getAllTemplates(req.query);
    res.json(result);
  });

  getLogs = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.whatsappService.getLogs(req.query);
    res.json(result);
  });

  getTodayBirthdays = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.birthdayReminderService.getTodayBirthdayCustomers();
    res.json({ success: true, data: result, total: result.length });
  });

  sendTodayBirthdays = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { customerId, resend } = validate(sendBirthdayGreetingsSchema, req.body ?? {});
    const result = customerId
      ? await this.birthdayReminderService.sendBirthdayGreeting(customerId, { userId: req.user?.id, allowLink: true, resend })
      : await this.birthdayReminderService.sendAllTodayBirthdayGreetings(req.user?.id);
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
