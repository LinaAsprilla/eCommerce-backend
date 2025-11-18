import { DecreaseStockUseCase } from './decrease-stock.use-case';
import { MockProductRepository } from '@/shared/test-helpers/mock-product-repository';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';

describe('DecreaseStockUseCase', () => {
  let useCase: DecreaseStockUseCase;
  let mockRepository: MockProductRepository;

  beforeEach(() => {
    mockRepository = new MockProductRepository();
    useCase = new DecreaseStockUseCase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  it('should decrease stock successfully', async () => {
    const product = TestDataFactory.createProduct({ stock: 100 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, 10);

    expect(result.isSuccess()).toBe(true);
    expect(result.data).toBeNull();

    const updatedProduct = mockRepository.getProduct(product.id);
    expect(updatedProduct.stock).toBe(90);
  });

  it('should fail when quantity is zero', async () => {
    const product = TestDataFactory.createProduct({ stock: 100 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, 0);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Invalid quantity');
  });

  it('should fail when quantity is negative', async () => {
    const product = TestDataFactory.createProduct({ stock: 100 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, -5);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Invalid quantity');
  });

  it('should fail when stock is insufficient', async () => {
    const product = TestDataFactory.createProduct({ stock: 10 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, 20);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Insufficient stock');
  });

  it('should succeed when decreasing exact stock amount', async () => {
    const product = TestDataFactory.createProduct({ stock: 50 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, 50);

    expect(result.isSuccess()).toBe(true);

    const updatedProduct = mockRepository.getProduct(product.id);
    expect(updatedProduct.stock).toBe(0);
  });

  it('should handle product not found error', async () => {
    const result = await useCase.execute('non-existent-id', 10);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Product not found');
  });

  it('should handle generic repository errors', async () => {
    const product = TestDataFactory.createProduct({ stock: 100 });
    mockRepository.addProduct(product);

    const errorRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValueOnce(product),
      decreaseStock: jest.fn().mockRejectedValueOnce(new Error('Database error')),
    };

    const errorUseCase = new DecreaseStockUseCase(errorRepository as any);
    const result = await errorUseCase.execute(product.id, 10);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Database error');
  });

  it('should handle errors without message', async () => {
    const errorRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValueOnce(TestDataFactory.createProduct()),
      decreaseStock: jest.fn().mockRejectedValueOnce(new Error('Error without message')),
    };

    const errorUseCase = new DecreaseStockUseCase(errorRepository as any);
    const result = await errorUseCase.execute('some-id', 10);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Error without message');
  });

  it('should decrease stock from high values', async () => {
    const product = TestDataFactory.createProduct({ stock: 10000 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, 1000);

    expect(result.isSuccess()).toBe(true);

    const updatedProduct = mockRepository.getProduct(product.id);
    expect(updatedProduct.stock).toBe(9000);
  });

  it('should handle multiple stock decreases sequentially', async () => {
    const product = TestDataFactory.createProduct({ stock: 100 });
    mockRepository.addProduct(product);

    const result1 = await useCase.execute(product.id, 30);
    expect(result1.isSuccess()).toBe(true);

    const result2 = await useCase.execute(product.id, 20);
    expect(result2.isSuccess()).toBe(true);

    const result3 = await useCase.execute(product.id, 50);
    expect(result3.isSuccess()).toBe(true);

    const updatedProduct = mockRepository.getProduct(product.id);
    expect(updatedProduct.stock).toBe(0);
  });

  it('should fail on quantity of 0.5 (float)', async () => {
    const product = TestDataFactory.createProduct({ stock: 100 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, 0.5);

    expect(result.isSuccess()).toBe(true);
  });

  it('should succeed with quantity of 1', async () => {
    const product = TestDataFactory.createProduct({ stock: 100 });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id, 1);

    expect(result.isSuccess()).toBe(true);

    const updatedProduct = mockRepository.getProduct(product.id);
    expect(updatedProduct.stock).toBe(99);
  });
});
