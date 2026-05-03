import { ICreamRepository } from '../contracts/ICreamRepository';

export class GetCreamSalesSummary {
  constructor(private creamRepository: ICreamRepository) {}

  async execute(): Promise<any[]> {
    return this.creamRepository.getSalesSummary();
  }
}
