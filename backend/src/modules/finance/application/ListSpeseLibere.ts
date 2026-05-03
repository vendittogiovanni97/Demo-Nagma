import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { SpesaLibera } from '../domain/SpesaLibera';

export class ListSpeseLibere {
  constructor(private spesaLiberaRepository: ISpesaLiberaRepository) {}

  async execute(month?: string, page?: number, limit?: number): Promise<IPaginatedResponse<SpesaLibera>> {
    return this.spesaLiberaRepository.findAllPaged(month, page, limit);
  }
}
