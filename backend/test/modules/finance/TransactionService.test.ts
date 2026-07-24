import { AppError } from '../../../src/core/shared/errors/AppError';

const createMockPrisma = () => ({
  transaction: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transactionHistory: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { TransactionService } from '../../../src/modules/finance/services/transactionService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

function txRow(overrides = {}) {
  return {
    id: 1,
    type: 'ENTRATA',
    category: 'Tatuaggio',
    description: 'Test',
    amount: 100,
    date: new Date(),
    sourceId: null,
    sourceType: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function mockTx() {
  return {
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
    },
    transactionHistory: {
      create: jest.fn(),
    },
  };
}

describe('TransactionService', () => {
  let transactionService: TransactionService;

  beforeEach(() => {
    jest.clearAllMocks();
    transactionService = new TransactionService();
  });

  describe('create', () => {
    it('should create transaction with history when userId provided', async () => {
      const tx = mockTx();
      tx.transaction.create.mockResolvedValue(txRow());
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      const result = await transactionService.create({
        type: 'ENTRATA',
        category: 'Tatuaggio',
        description: 'Test',
        amount: 100,
      }, 1);

      expect(tx.transaction.create).toHaveBeenCalled();
      expect(tx.transactionHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATED' }) })
      );
      expect(result.id).toBe(1);
    });

    it('should create transaction without history when no userId', async () => {
      const tx = mockTx();
      tx.transaction.create.mockResolvedValue(txRow({ id: 2, type: 'USCITA' }));
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await transactionService.create({
        type: 'USCITA',
        category: 'Materiali',
        description: 'Inchiostro',
        amount: 50,
      });

      expect(tx.transactionHistory.create).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft-delete transaction and add history', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(txRow());
      const tx = mockTx();
      mockPrisma.$transaction.mockImplementation((cb: Function) => cb(tx));

      await transactionService.delete(1, 1);

      expect(tx.transaction.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(tx.transactionHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'DELETED' }) })
      );
    });

    it('should throw 404 when transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(transactionService.delete(999))
        .rejects.toThrow(new AppError('Transazione non trovata', 404));
    });
  });
});
