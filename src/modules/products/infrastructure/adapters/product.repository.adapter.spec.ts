import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryAdapter } from './product.repository.adapter';
import { ProductOrm } from '../persistence/product.orm-entity';
import { Product } from '../../domain/product.entity';

describe('ProductRepositoryAdapter', () => {
  let adapter: ProductRepositoryAdapter;
  let mockRepository: jest.Mocked<Repository<ProductOrm>>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      decrement: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepositoryAdapter,
        {
          provide: getRepositoryToken(ProductOrm),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<ProductRepositoryAdapter>(ProductRepositoryAdapter);
  });

  describe('findAll', () => {
    it('should return all products from database', async () => {
      const mockOrms = [
        { id: '1', name: 'Product 1', description: 'Desc 1', price: 10000, stock: 100 },
        { id: '2', name: 'Product 2', description: 'Desc 2', price: 20000, stock: 50 },
      ];

      mockRepository.find.mockResolvedValueOnce(mockOrms as any);

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Product);
      expect(result[0].id).toBe('1');
      expect(result[0].name).toBe('Product 1');
      expect(result[1].price).toBe(20000);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should map ORM entities to domain entities correctly', async () => {
      const mockOrms = [
        {
          id: '123',
          name: 'Test Product',
          description: 'Test Description',
          price: 15000,
          stock: 25,
        },
      ];

      mockRepository.find.mockResolvedValueOnce(mockOrms as any);

      const result = await adapter.findAll();

      expect(result[0].id).toBe('123');
      expect(result[0].name).toBe('Test Product');
      expect(result[0].description).toBe('Test Description');
      expect(result[0].price).toBe(15000);
      expect(result[0].stock).toBe(25);
    });

    it('should handle database errors gracefully', async () => {
      mockRepository.find.mockRejectedValueOnce(new Error('Database connection error'));

      try {
        await adapter.findAll();
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Database connection error');
      }
    });
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      const mockOrm = { id: '1', name: 'Product 1', description: 'Desc', price: 10000, stock: 100 };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);

      const result = await adapter.findById('1');

      expect(result).toBeInstanceOf(Product);
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('Product 1');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null when product does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await adapter.findById('non-existent-id');

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
    });

    it('should map ORM entity to domain entity', async () => {
      const mockOrm = {
        id: 'prod-123',
        name: 'Premium Product',
        description: 'Premium Desc',
        price: 99999,
        stock: 5,
      };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);

      const result = await adapter.findById('prod-123');

      expect(result?.id).toBe('prod-123');
      expect(result?.name).toBe('Premium Product');
      expect(result?.price).toBe(99999);
      expect(result?.stock).toBe(5);
    });

    it('should call repository with correct parameters', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await adapter.findById('test-id-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id-123' } });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      mockRepository.findOne.mockRejectedValueOnce(new Error('Database error'));

      try {
        await adapter.findById('1');
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Database error');
      }
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock for a product', async () => {
      const mockOrm = { id: '1', name: 'Product', description: 'Desc', price: 10000, stock: 100 };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);
      mockRepository.decrement.mockResolvedValueOnce({ affected: 1 } as any);

      await adapter.decreaseStock('1', 10);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.decrement).toHaveBeenCalledWith({ id: '1' }, 'stock', 10);
    });

    it('should throw error when product not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      try {
        await adapter.decreaseStock('non-existent', 10);
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Product not found');
      }
    });

    it('should throw error when stock is insufficient', async () => {
      const mockOrm = { id: '1', name: 'Product', description: 'Desc', price: 10000, stock: 5 };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);

      try {
        await adapter.decreaseStock('1', 10);
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Insufficient stock');
      }
    });

    it('should succeed when stock is exactly equal to quantity', async () => {
      const mockOrm = { id: '1', name: 'Product', description: 'Desc', price: 10000, stock: 10 };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);
      mockRepository.decrement.mockResolvedValueOnce({ affected: 1 } as any);

      await adapter.decreaseStock('1', 10);

      expect(mockRepository.decrement).toHaveBeenCalledWith({ id: '1' }, 'stock', 10);
    });

    it('should succeed when stock is greater than quantity', async () => {
      const mockOrm = { id: '1', name: 'Product', description: 'Desc', price: 10000, stock: 100 };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);
      mockRepository.decrement.mockResolvedValueOnce({ affected: 1 } as any);

      await adapter.decreaseStock('1', 50);

      expect(mockRepository.decrement).toHaveBeenCalledWith({ id: '1' }, 'stock', 50);
    });

    it('should use atomic decrement to prevent race conditions', async () => {
      const mockOrm = { id: '1', name: 'Product', description: 'Desc', price: 10000, stock: 100 };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);
      mockRepository.decrement.mockResolvedValueOnce({ affected: 1 } as any);

      await adapter.decreaseStock('1', 10);

      // Verify that decrement (atomic) is used instead of read-modify-write
      expect(mockRepository.decrement).toHaveBeenCalledTimes(1);
      expect(mockRepository.decrement).toHaveBeenCalledWith({ id: '1' }, 'stock', 10);
    });

    it('should handle database errors during decrement', async () => {
      const mockOrm = { id: '1', name: 'Product', description: 'Desc', price: 10000, stock: 100 };

      mockRepository.findOne.mockResolvedValueOnce(mockOrm as any);
      mockRepository.decrement.mockRejectedValueOnce(new Error('Database error'));

      try {
        await adapter.decreaseStock('1', 10);
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Database error');
      }
    });

    it('should validate quantity before attempting update', async () => {
      // This test verifies the validation logic is applied in correct order
      mockRepository.findOne.mockResolvedValueOnce({ stock: 5 } as any);

      try {
        await adapter.decreaseStock('1', 10);
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Insufficient stock');
        // Decrement should not be called if validation fails
        expect(mockRepository.decrement).not.toHaveBeenCalled();
      }
    });
  });
});
