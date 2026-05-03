import { Cream } from '../domain/Cream';
import { CreamSale } from '../domain/CreamSale';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface CreamSaleFilters {
  startDate?: string;
  endDate?: string;
  artistId?: number;
}

export interface ICreamRepository {
  // Cream
  findActive(): Promise<Cream | null>;
  findById(id: number): Promise<Cream | null>;
  create(cream: Cream): Promise<Cream>;
  
  // Sales
  createSale(sale: CreamSale): Promise<CreamSale>;
  findSalesByCreamPaged(creamId: number, page: number, limit: number, filters?: CreamSaleFilters): Promise<IPaginatedResponse<CreamSale>>;
  getSalesSummary(): Promise<any[]>;
}
