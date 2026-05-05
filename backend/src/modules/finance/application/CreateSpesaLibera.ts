import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';
import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { CreateSpesaLiberaDTO } from '../contracts/FinanceDTOs';
import { SpesaLibera } from '../domain/SpesaLibera';
import { Transaction } from '../domain/Transaction';
import { financeCache } from './FinanceCache';

export class CreateSpesaLibera {
  constructor(
    private spesaLiberaRepository: ISpesaLiberaRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(data: CreateSpesaLiberaDTO): Promise<SpesaLibera> {
    financeCache.invalidate();
    
    const spesa = new SpesaLibera({
      name: data.name,
      price: data.price,
    });

    const created = await this.spesaLiberaRepository.create(spesa);

    // Create corresponding transaction
    await this.transactionRepository.create(new Transaction({
      type: 'EXPENSE',
      category: 'Spese Libere',
      description: `Spesa Libera: ${data.name}`,
      amount: data.price,
      date: new Date(),
      sourceId: created.id,
      sourceType: 'SPESA_LIBERA',
    }));

    return created;
  }
}
