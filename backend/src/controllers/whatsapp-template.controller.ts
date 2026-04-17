import { Response } from 'express';

import { AuthRequest } from '../middlewares/auth.middleware';
import { WhatsAppTemplateService } from '../services/whatsapp-template.service';
import { asyncHandler } from '../utils/async-handler';

const service = new WhatsAppTemplateService();

export class WhatsAppTemplateController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.getAll(req.query.search as string | undefined);
    res.json(data);
  });

  getLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.getLogs(req.query);
    res.json(data);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.create(req.body);
    res.status(201).json(data);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.update(Number(req.params.id), req.body);
    res.json(data);
  });

  duplicate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.duplicate(Number(req.params.id));
    res.status(201).json(data);
  });

  sendManual = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.sendManualMessage(req.body, req.user!.id);
    res.status(201).json(data);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await service.delete(Number(req.params.id));
    res.status(204).send();
  });
}
