import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepositoryAdapter } from './transaction.repository.adapter';
import { TransactionOrm } from '../persistence/transaction.orm-entity';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';

describe('TransactionRepositoryAdapter', () => {
  let adapter: TransactionRepositoryAdapter;
  let mockRepository: jest.Mocked<Repository<TransactionOrm>>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepositoryAdapter,
        {
          provide: getRepositoryToken(TransactionOrm),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<TransactionRepositoryAdapter>(TransactionRepositoryAdapter);
  });

  describe('create', () => {
    it('should create a transaction in the database', async () => {
      const transaction = TestDataFactory.createTransaction();
      const mockOrmEntity = { id: transaction.id, status: transaction.status };

      mockRepository.create.mockReturnValueOnce(mockOrmEntity as any);
      mockRepository.save.mockResolvedValueOnce(mockOrmEntity as any);

      await adapter.create(transaction);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrmEntity);
    });

    it('should save transaction with correct fields', async () => {
      const transaction = TestDataFactory.createTransaction({
        amount: 25000,
        status: 'APPROVED',
        providerTransactionId: 'txn_123',
      });

      const mockOrmEntity = { id: transaction.id, status: transaction.status };
      mockRepository.create.mockReturnValueOnce(mockOrmEntity as any);
      mockRepository.save.mockResolvedValueOnce(mockOrmEntity as any);

      await adapter.create(transaction);

      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.id).toBe(transaction.id);
      expect(createCall.status).toBe('APPROVED');
      expect(createCall.amount).toBe(25000);
      expect(createCall.providerTransactionId).toBe('txn_123');
    });

    it('should handle null providerTransactionId', async () => {
      const transaction = TestDataFactory.createTransaction({
        providerTransactionId: undefined,
      });

      const mockOrmEntity = { id: transaction.id };
      mockRepository.create.mockReturnValueOnce(mockOrmEntity as any);
      mockRepository.save.mockResolvedValueOnce(mockOrmEntity as any);

      await adapter.create(transaction);

      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.providerTransactionId).toBeNull();
    });

    it('should save transaction with product reference', async () => {
      const productId = 'prod-123';
      const transaction = TestDataFactory.createTransaction({
        productId: productId,
      });

      const mockOrmEntity = { id: transaction.id };
      mockRepository.create.mockReturnValueOnce(mockOrmEntity as any);
      mockRepository.save.mockResolvedValueOnce(mockOrmEntity as any);

      await adapter.create(transaction);

      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.product.id).toBe(productId);
    });

    it('should handle database errors', async () => {
      const transaction = TestDataFactory.createTransaction();

      mockRepository.create.mockReturnValueOnce({} as any);
      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));

      try {
        await adapter.create(transaction);
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Database error');
      }
    });

    it('should call repository methods in correct order', async () => {
      const transaction = TestDataFactory.createTransaction();
      const mockOrmEntity = { id: transaction.id };

      mockRepository.create.mockReturnValueOnce(mockOrmEntity as any);
      mockRepository.save.mockResolvedValueOnce(mockOrmEntity as any);

      await adapter.create(transaction);

      const createCallOrder = mockRepository.create.mock.invocationCallOrder[0];
      const saveCallOrder = mockRepository.save.mock.invocationCallOrder[0];

      expect(createCallOrder).toBeLessThan(saveCallOrder);
    });

    it('should handle different transaction statuses', async () => {
      const statuses = ['APPROVED', 'PENDING', 'DECLINED', 'ERROR'];

      for (const status of statuses) {
        mockRepository.create.mockClear();
        mockRepository.save.mockClear();

        const transaction = TestDataFactory.createTransaction({ status: status });
        const mockOrmEntity = { id: transaction.id, status };

        mockRepository.create.mockReturnValueOnce(mockOrmEntity as any);
        mockRepository.save.mockResolvedValueOnce(mockOrmEntity as any);

        await adapter.create(transaction);

        const createCall = mockRepository.create.mock.calls[0][0];
        expect(createCall.status).toBe(status);
      }
    });
  });
});
