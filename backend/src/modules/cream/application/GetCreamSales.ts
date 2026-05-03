import { ICreamRepository, CreamSaleFilters } from '../contracts/ICreamRepository';
import { CreamSale } from '../domain/CreamSale';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export class GetCreamSales {
  constructor(private creamRepository: ICreamRepository) {}

  async execute(creamId: number, page: number, limit: number, filters?: CreamSaleFilters): Promise<IPaginatedResponse<CreamSale>> {
    return this.creamRepository.findSalesByCreamPaged(creamId, page, limit, filters);
  }
}
