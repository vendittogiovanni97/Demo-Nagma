import { SpesaLibera } from '../domain/SpesaLibera';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface ISpesaLiberaRepository {
  findAll(month?: string): Promise<SpesaLibera[]>;
  findAllPaged(month?: string, page?: number, limit?: number): Promise<IPaginatedResponse<SpesaLibera>>;
  create(spesa: SpesaLibera): Promise<SpesaLibera>;
  delete(id: number): Promise<boolean>;
}
