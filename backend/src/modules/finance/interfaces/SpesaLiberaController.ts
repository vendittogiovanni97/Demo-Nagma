import { Request, Response } from 'express';
import { ListSpeseLibere } from '../application/ListSpeseLibere';
import { CreateSpesaLibera } from '../application/CreateSpesaLibera';
import { DeleteSpesaLibera } from '../application/DeleteSpesaLibera';
import { validate } from '../../../shared/utils/validation';
import { createSpesaLiberaSchema } from './spesa-libera.schemas';
import { parseId } from '../../../shared/utils/parse-id';
import { configService } from '../../../container';
import { AppError } from '../../../shared/errors/AppError';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class SpesaLiberaController {
  constructor(
    private listSpeseLibereUseCase: ListSpeseLibere,
    private createSpesaLiberaUseCase: CreateSpesaLibera,
    private deleteSpesaLiberaUseCase: DeleteSpesaLibera
  ) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : configService.getMaxPageLimitSync();
    const result = await this.listSpeseLibereUseCase.execute(month, page, limit);
    res.json({
      ...result,
      data: result.data.map(s => s.toJSON())
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createSpesaLiberaSchema, req.body);
    const result = await this.createSpesaLiberaUseCase.execute(data as any);
    res.status(201).json({ data: result.toJSON() });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const success = await this.deleteSpesaLiberaUseCase.execute(id);
    if (!success) {
      throw new AppError('Spesa non trovata', 404, 'NOT_FOUND');
    }
    res.status(204).send();
  });
}
