import { transactionApi } from '@/common/shared/api/transaction.api';
import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

jest.mock('@/common/shared/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

describe('transactionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applica la paginazione standard e inoltra il tipo Prisma', async () => {
    mockedClient.get.mockResolvedValue({ data: [], total: 0, page: 1, limit: 25, pages: 0, totalPages: 0 });

    await transactionApi.getAll({ type: 'ENTRATA', month: '2026-07' });

    expect(mockedClient.get).toHaveBeenCalledWith(ENDPOINTS.TRANSACTIONS.BASE, {
      page: 1,
      limit: 25,
      type: 'ENTRATA',
      month: '2026-07',
    });
  });

  it('usa lo stesso client per creazione e aggiornamento', async () => {
    const payload = {
      type: 'USCITA' as const,
      category: 'Affitto',
      description: 'Affitto luglio',
      amount: 1000,
    };

    await transactionApi.create(payload);
    await transactionApi.update(7, { amount: 900 });

    expect(mockedClient.post).toHaveBeenCalledWith(ENDPOINTS.TRANSACTIONS.BASE, payload);
    expect(mockedClient.patch).toHaveBeenCalledWith(ENDPOINTS.TRANSACTIONS.BY_ID(7), { amount: 900 });
  });
});
