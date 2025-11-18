import { CreateTransactionsUseCase } from './create-transactions.use-case';
import { MockTransactionRepository } from '@/shared/test-helpers/mock-transaction-repository';
import { MockProductRepository } from '@/shared/test-helpers/mock-product-repository';
import { MockFakePiwom } from '@/shared/test-helpers/mock-piwom';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';
import { Transaction } from '@/modules/transactions/domain/transaction.entity';

describe('CreateTransactionsUseCase', () => {
  let useCase: CreateTransactionsUseCase;
  let transactionRepo: MockTransactionRepository;
  let productRepo: MockProductRepository;
  let piwomAdapter: MockFakePiwom;

  beforeEach(() => {
    transactionRepo = new MockTransactionRepository();
    productRepo = new MockProductRepository();
    piwomAdapter = new MockFakePiwom();

    useCase = new CreateTransactionsUseCase(transactionRepo, piwomAdapter, productRepo);
  });

  afterEach(() => {
    transactionRepo.clear();
    productRepo.clear();
  });

  describe('successful transaction flow', () => {
    it('should create a transaction successfully with product', async () => {
      const product = TestDataFactory.createProduct({ price: 10000 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
      expect(result.data.status).toBe('APPROVED');
      expect(result.data.status_message).toBe('Transaction approved');
    });

    it('should decrease product stock after successful transaction', async () => {
      const product = TestDataFactory.createProduct({ price: 10000, stock: 100 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        5,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);

      const updatedProduct = productRepo.getProduct(product.id);
      expect(updatedProduct.stock).toBe(95);
    });

    it('should create transaction record in repository', async () => {
      const product = TestDataFactory.createProduct({ price: 10000 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      await useCase.execute(transaction);

      expect(transactionRepo.getCount()).toBeGreaterThan(0);
    });

    it('should handle transaction without product', async () => {
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(false);
    });
  });

  describe('product validation', () => {
    it('should fail when product does not exist', async () => {
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        'non-existent-product-id',
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Product not found');
    });

    it('should fail when amount is less than product price', async () => {
      const product = TestDataFactory.createProduct({ price: 50000 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        30000, // Less than product price
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toContain('Amount must be greater than or equal to product price');
    });

    it('should succeed when amount equals product price', async () => {
      const product = TestDataFactory.createProduct({ price: 10000 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
    });

    it('should succeed when amount is greater than product price', async () => {
      const product = TestDataFactory.createProduct({ price: 10000 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        15000, // Greater than product price
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
    });
  });

  describe('card tokenization', () => {
    it('should tokenize card before creating transaction', async () => {
      const product = TestDataFactory.createProduct();
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
      expect(paymentMethod.token).toBeDefined();
    });

    it('should fail when card tokenization fails', async () => {
      piwomAdapter.setTokenizeCardFail(true);

      const product = TestDataFactory.createProduct();
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isFailure()).toBe(true);
    });

    it('should handle tokenization with different card types', async () => {
      const product = TestDataFactory.createProduct();
      const card = TestDataFactory.createMastercardCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
      expect(paymentMethod.token).toBeDefined();
    });
  });

  describe('payment processing', () => {
    it('should create transaction with payment provider', async () => {
      const product = TestDataFactory.createProduct();
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
      expect(result.data.status).toBeDefined();
    });

    it('should fail when payment provider returns error', async () => {
      piwomAdapter.setCreateTransactionFail(true);

      const product = TestDataFactory.createProduct();
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isFailure()).toBe(true);
    });

    it('should set correct transaction status from provider', async () => {
      piwomAdapter.setTransactionStatus('PENDING');

      const product = TestDataFactory.createProduct();
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
      expect(result.data.status).toBe('PENDING');
    });
  });

  describe('error handling', () => {
    it('should handle generic errors gracefully', async () => {
      const errorRepository = {
        create: jest.fn().mockRejectedValueOnce(new Error('Database connection error')),
      };

      const errorUseCase = new CreateTransactionsUseCase(
        errorRepository as any,
        piwomAdapter,
        productRepo,
      );

      const product = TestDataFactory.createProduct();
      productRepo.addProduct(product);

      const transaction = new Transaction(
        TestDataFactory.createCard(),
        TestDataFactory.createPaymentMethod(),
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await errorUseCase.execute(transaction);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Database connection error');
    });

    it('should handle errors without message', async () => {
      const errorRepository = {
        create: jest.fn().mockRejectedValueOnce(new Error('Error')),
      };

      const errorUseCase = new CreateTransactionsUseCase(
        errorRepository as any,
        piwomAdapter,
        productRepo,
      );

      const product = TestDataFactory.createProduct();
      productRepo.addProduct(product);

      const transaction = new Transaction(
        TestDataFactory.createCard(),
        TestDataFactory.createPaymentMethod(),
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await errorUseCase.execute(transaction);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Error');
    });
  });

  describe('stock management', () => {
    it('should handle stock decrease for different quantities', async () => {
      const product = TestDataFactory.createProduct({ stock: 1000 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        product.id,
        undefined,
        undefined,
        undefined,
        50,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);

      const updatedProduct = productRepo.getProduct(product.id);
      expect(updatedProduct.stock).toBe(950);
    });

    it('should handle transaction without productId', async () => {
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_123',
        undefined,
        undefined,
        undefined,
        undefined,
        1,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(false);
    });
  });

  describe('complete workflow', () => {
    it('should execute complete transaction workflow', async () => {
      const product = TestDataFactory.createProduct({ price: 20000, stock: 100 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      const transaction = new Transaction(
        card,
        paymentMethod,
        25000,
        'ref_complete_workflow',
        product.id,
        undefined,
        undefined,
        undefined,
        10,
      );

      const result = await useCase.execute(transaction);

      expect(result.isSuccess()).toBe(true);
      expect(result.data.status).toBe('APPROVED');

      const updatedProduct = productRepo.getProduct(product.id);
      expect(updatedProduct.stock).toBe(90);

      expect(transactionRepo.getCount()).toBeGreaterThan(0);
    });

    it('should rollback on any failure in workflow', async () => {
      const product = TestDataFactory.createProduct({ stock: 100 });
      const card = TestDataFactory.createCard();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      productRepo.addProduct(product);

      piwomAdapter.setCreateTransactionFail(true);

      const transaction = new Transaction(
        card,
        paymentMethod,
        10000,
        'ref_failure',
        product.id,
        undefined,
        undefined,
        undefined,
        10,
      );

      const result = await useCase.execute(transaction);

      expect(result.isFailure()).toBe(true);

      // Stock should not be decreased since transaction failed
      const productStock = productRepo.getProduct(product.id);
      expect(productStock.stock).toBe(100);
    });
  });
});
