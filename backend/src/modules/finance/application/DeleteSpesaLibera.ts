import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';

export class DeleteSpesaLibera {
  constructor(private spesaLiberaRepository: ISpesaLiberaRepository) {}

  async execute(id: number): Promise<boolean> {
    return this.spesaLiberaRepository.delete(id);
  }
}
