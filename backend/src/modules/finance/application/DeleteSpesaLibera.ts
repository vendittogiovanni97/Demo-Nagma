import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';
import { ITransactionRepository } from '../contracts/ITransactionRepository';

export class DeleteSpesaLibera {
  constructor(
    private spesaLiberaRepository: ISpesaLiberaRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(id: number): Promise<boolean> {
    const success = await this.spesaLiberaRepository.delete(id);
    if (success) {
      await this.transactionRepository.deleteBySource(id, 'SPESA_LIBERA');
    }
    return success;
  }
}
