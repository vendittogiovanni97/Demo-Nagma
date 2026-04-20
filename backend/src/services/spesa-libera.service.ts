import { Prisma } from '@prisma/client';
import { SpesaLiberaRepository } from '../repositories/spesa-libera.repository';

const repo = new SpesaLiberaRepository();

export class SpesaLiberaService {
  private repo: SpesaLiberaRepository;

  constructor(repository: SpesaLiberaRepository = repo) {
    this.repo = repository;
  }

  async getAll(month?: string) {
    return this.repo.findAll(month);
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
