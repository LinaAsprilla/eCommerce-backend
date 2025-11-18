import { GetProductUseCase } from './get-product.use-case';
import { MockProductRepository } from '@/shared/test-helpers/mock-product-repository';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
  let mockRepository: MockProductRepository;

  beforeEach(() => {
    mockRepository = new MockProductRepository();
    useCase = new GetProductUseCase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  it('should return a product when it exists', async () => {
    const product = TestDataFactory.createProduct({ name: 'Test Product' });
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id);

    expect(result.isSuccess()).toBe(true);
    expect(result.data).toEqual(product);
  });

  it('should return failure when product does not exist', async () => {
    const result = await useCase.execute('non-existent-id');

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Product not found');
  });

  it('should return correct product when multiple products exist', async () => {
    const product1 = TestDataFactory.createProduct({ name: 'Product 1' });
    const product2 = TestDataFactory.createProduct({ name: 'Product 2' });
    const product3 = TestDataFactory.createProduct({ name: 'Product 3' });

    mockRepository.addProduct(product1);
    mockRepository.addProduct(product2);
    mockRepository.addProduct(product3);

    const result = await useCase.execute(product2.id);

    expect(result.isSuccess()).toBe(true);
    expect(result.data).toEqual(product2);
    expect(result.data.name).toBe('Product 2');
  });

  it('should handle repository errors gracefully', async () => {
    const errorRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockRejectedValueOnce(new Error('Connection failed')),
      decreaseStock: jest.fn(),
    };

    const errorUseCase = new GetProductUseCase(errorRepository as any);
    const result = await errorUseCase.execute('some-id');

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Connection failed');
  });

  it('should handle generic repository errors', async () => {
    const errorRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockRejectedValueOnce(new Error('Connection failed')),
      decreaseStock: jest.fn(),
    };

    const errorUseCase = new GetProductUseCase(errorRepository as any);
    const result = await errorUseCase.execute('some-id');

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Connection failed');
  });

  it('should preserve all product properties', async () => {
    const product = TestDataFactory.createProduct({
      name: 'Premium Product',
      description: 'A premium product description',
      price: 50000,
      stock: 10,
    });

    mockRepository.addProduct(product);
    const result = await useCase.execute(product.id);

    expect(result.isSuccess()).toBe(true);
    expect(result.data.name).toBe('Premium Product');
    expect(result.data.description).toBe('A premium product description');
    expect(result.data.price).toBe(50000);
    expect(result.data.stock).toBe(10);
  });

  it('should handle empty id string', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Product not found');
  });

  it('should be case-sensitive for product id', async () => {
    const product = TestDataFactory.createProduct();
    mockRepository.addProduct(product);

    const result = await useCase.execute(product.id.toUpperCase());

    expect(result.isFailure()).toBe(true);
  });
});
