import { Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { CustomFieldService, CustomFieldData } from '../services/customFieldService';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

function getParam(params: any, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export class CustomFieldController {
  constructor(private readonly customFieldService: CustomFieldService) {}

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const { entityType } = req.query;

    const fields = await this.customFieldService.getAll(clientId, entityType as string);
    res.json({ success: true, data: fields });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const id = getParam(req.params, 'id');

    const field = await this.customFieldService.getById(id, clientId);
    if (!field) {
      return res.status(404).json({ success: false, error: 'Custom field not found' });
    }

    res.json({ success: true, data: field });
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const data: CustomFieldData = req.body;

    const field = await this.customFieldService.create(clientId, data);
    res.status(201).json({ success: true, data: field });
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const id = getParam(req.params, 'id');
    const data: Partial<CustomFieldData> = req.body;

    const field = await this.customFieldService.update(id, clientId, data);
    res.json({ success: true, data: field });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const id = getParam(req.params, 'id');

    await this.customFieldService.delete(id, clientId);
    res.json({ success: true, message: 'Custom field deleted' });
  });

  validate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const { entityType, customData } = req.body;

    const result = await this.customFieldService.validateCustomData(entityType, clientId, customData);
    res.json({ success: true, data: result });
  });
}