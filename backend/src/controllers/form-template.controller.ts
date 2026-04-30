import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { validate, createFormTemplateSchema, updateFormTemplateSchema } from '../schemas';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/AppError';


export class FormTemplateController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const where: any = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate + 'T23:59:59.999') };
    res.json(await prisma.formTemplate.findMany({ where, orderBy: [{ createdAt: 'desc' }] }));
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await prisma.formTemplate.findFirst({ where: { id: Number(req.params.id) } });
    if (!template) throw new AppError('Template non trovato', 404, 'NOT_FOUND');
    res.json(template);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(createFormTemplateSchema, req.body);
    res.status(201).json(await prisma.formTemplate.create({ data }));
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(updateFormTemplateSchema, req.body);
    res.json(await prisma.formTemplate.update({ where: { id: Number(req.params.id) }, data }));
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.formTemplate.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  });
}
