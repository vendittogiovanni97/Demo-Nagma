import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';
import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { financeCache } from './FinanceCache';

export class DeleteSpesaLibera {
  constructor(
    private spesaLiberaRepository: ISpesaLiberaRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(id: number): Promise<boolean> {
    financeCache.invalidate();
    const success = await this.spesaLiberaRepository.delete(id);
    if (success) {
      await this.transactionRepository.deleteBySource(id, 'SPESA_LIBERA');
    }
    return success;
  }
}
