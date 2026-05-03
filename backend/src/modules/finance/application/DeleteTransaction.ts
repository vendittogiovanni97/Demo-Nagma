import { ITransactionRepository } from '../contracts/ITransactionRepository';

export class DeleteTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<void> {
    return this.transactionRepository.delete(id);
  }
}
