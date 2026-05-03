import { ICreamRepository } from '../contracts/ICreamRepository';
import { CreateCreamSaleDTO } from '../contracts/CreamDTOs';
import { CreamSale } from '../domain/CreamSale';
import { AppError } from '../../../shared/errors/AppError';

export class CreateCreamSale {
  constructor(private creamRepository: ICreamRepository) {}

  async execute(data: CreateCreamSaleDTO): Promise<CreamSale> {
    const cream = await this.creamRepository.findById(data.creamId);
    if (!cream) throw new AppError('Crema non trovata', 404);

    const sale = new CreamSale({
      creamId: data.creamId,
      artistId: data.artistId,
      quantity: data.quantity,
    });
    return this.creamRepository.createSale(sale);
  }
}
