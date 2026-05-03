import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';
import { CreateSpesaLiberaDTO } from '../contracts/FinanceDTOs';
import { SpesaLibera } from '../domain/SpesaLibera';

export class CreateSpesaLibera {
  constructor(private spesaLiberaRepository: ISpesaLiberaRepository) {}

  async execute(data: CreateSpesaLiberaDTO): Promise<SpesaLibera> {
    const spesa = new SpesaLibera({
      name: data.name,
      price: data.price,
    });
    return this.spesaLiberaRepository.create(spesa);
  }
}
