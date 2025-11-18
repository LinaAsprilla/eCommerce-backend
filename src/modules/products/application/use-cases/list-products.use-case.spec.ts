import { ListProductsUseCase } from './list-products.use-case';
import { MockProductRepository } from '@/shared/test-helpers/mock-product-repository';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let mockRepository: MockProductRepository;

  beforeEach(() => {
    mockRepository = new MockProductRepository();
    useCase = new ListProductsUseCase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  it('should return an empty array when no products exist', async () => {
    const result = await useCase.execute();

    expect(result.isSuccess()).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('should return all products from repository', async () => {
    const product1 = TestDataFactory.createProduct({ name: 'Product 1' });
    const product2 = TestDataFactory.createProduct({ name: 'Product 2' });

    mockRepository.addProduct(product1);
    mockRepository.addProduct(product2);

    const result = await useCase.execute();

    expect(result.isSuccess()).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data).toContainEqual(product1);
    expect(result.data).toContainEqual(product2);
  });

  it('should handle repository errors gracefully', async () => {
    const errorRepository = {
      findAll: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };

    const errorUseCase = new ListProductsUseCase(errorRepository as any);
    const result = await errorUseCase.execute();

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Database error');
  });

  it('should handle generic repository errors', async () => {
    const errorRepository = {
      findAll: jest.fn().mockRejectedValueOnce(new Error('Generic error')),
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };

    const errorUseCase = new ListProductsUseCase(errorRepository as any);
    const result = await errorUseCase.execute();

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Generic error');
  });

  it('should return success with single product', async () => {
    const product = TestDataFactory.createProduct();
    mockRepository.addProduct(product);

    const result = await useCase.execute();

    expect(result.isSuccess()).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual(product);
  });

  it('should return success with multiple products', async () => {
    const products = Array.from({ length: 5 }, () => TestDataFactory.createProduct());
    for (const p of products) {
      mockRepository.addProduct(p);
    }

    const result = await useCase.execute();

    expect(result.isSuccess()).toBe(true);
    expect(result.data).toHaveLength(5);
  });
});
