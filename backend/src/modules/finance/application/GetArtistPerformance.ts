import { ITransactionRepository } from '../contracts/ITransactionRepository';

export class GetArtistPerformance {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(month?: string): Promise<Array<{ artistId: number; artistName: string; artistColor: string | null; bookings: number; revenue: number }>> {
    return this.transactionRepository.getArtistPerformance(month);
  }
}
