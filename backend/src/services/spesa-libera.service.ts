import { Prisma } from '@prisma/client';
import { SpesaLiberaRepository } from '../repositories/spesa-libera.repository';
import { config } from '../config/env';
import { configService } from './config.service';
import { mapSpesaLiberaDecimals } from '../utils/decimal-mapper';

const repo = new SpesaLiberaRepository();

export class SpesaLiberaService {
  private repo: SpesaLiberaRepository;

  constructor(repository: SpesaLiberaRepository = repo) {
    this.repo = repository;
  }

  async getAll(month?: string, page = 1, limit = configService.getMaxPageLimitSync()) {
    const result = await this.repo.findAllPaged(month, page, limit);
    return { ...result, data: result.data.map(mapSpesaLiberaDecimals) };
  }

  async create(data: Prisma.SpesaLiberaCreateInput) {
    const created = await this.repo.create(data);
    return mapSpesaLiberaDecimals(created);
  }

  async delete(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) return null;
    await this.repo.delete(id);
    return true;
  }
}
