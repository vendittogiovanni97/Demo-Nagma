import { ICreamRepository } from '../contracts/ICreamRepository';
import { Cream } from '../domain/Cream';
import { AppError } from '../../../shared/errors/AppError';

export class GetActiveCream {
  constructor(private creamRepository: ICreamRepository) {}

  async execute(): Promise<Cream> {
    const cream = await this.creamRepository.findActive();
    if (!cream) throw new AppError('Nessuna crema attiva', 404);
    return cream;
  }
}
