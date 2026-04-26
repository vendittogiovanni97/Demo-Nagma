import { Prisma } from '@prisma/client';
import { SpesaLiberaRepository } from '../repositories/spesa-libera.repository';
import { config } from '../config/env';
import { configService } from './config.service';

const repo = new SpesaLiberaRepository();

export class SpesaLiberaService {
  private repo: SpesaLiberaRepository;

  constructor(repository: SpesaLiberaRepository = repo) {
    this.repo = repository;
  }

  async getAll(month?: string, page = 1, limit = configService.getMaxPageLimitSync()) {
    return this.repo.findAllPaged(month, page, limit);
  }

  async create(data: Prisma.SpesaLiberaCreateInput) {
    return this.repo.create(data);
  }

  async delete(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) return null;
    await this.repo.delete(id);
    return true;
  }
}
