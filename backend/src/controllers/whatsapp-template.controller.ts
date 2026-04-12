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
    const data = await service.update(String(req.params.id), req.body);
    res.json(data);
  });

  duplicate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.duplicate(String(req.params.id));
    res.status(201).json(data);
  });

  sendManual = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Sessione non valida' });
      return;
    }

    const data = await service.sendManualMessage(req.body, userId);
    res.status(201).json(data);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await service.delete(String(req.params.id));
    res.status(204).send();
  });
}
