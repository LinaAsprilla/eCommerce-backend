import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';
import { Result } from '@/shared/result';

describe('ProductsController', () => {
  let controller: ProductsController;
  let listProductsUseCase: ListProductsUseCase;
  let getProductUseCase: GetProductUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ListProductsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetProductUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    listProductsUseCase = module.get<ListProductsUseCase>(ListProductsUseCase);
    getProductUseCase = module.get<GetProductUseCase>(GetProductUseCase);
  });

  describe('list', () => {
    it('should return all products', async () => {
      const product1 = TestDataFactory.createProduct({ name: 'Product 1' });
      const product2 = TestDataFactory.createProduct({ name: 'Product 2' });
      const result = Result.ok([product1, product2]);

      jest.spyOn(listProductsUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.list();

      expect(response).toEqual([product1, product2]);
      expect(listProductsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      const result = Result.ok([]);

      jest.spyOn(listProductsUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.list();

      expect(response).toEqual([]);
      expect(listProductsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest when list fails', async () => {
      const result = Result.fail<any>('Database error');

      jest.spyOn(listProductsUseCase, 'execute').mockResolvedValueOnce(result);

      try {
        await controller.list();
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect((error as HttpException).getResponse()).toBe('Database error');
      }
    });

    it('should throw BadRequest with default error message', async () => {
      const result = Result.fail<any>('Connection failed');

      jest.spyOn(listProductsUseCase, 'execute').mockResolvedValueOnce(result);

      try {
        await controller.list();
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('getOne', () => {
    it('should return a product by id', async () => {
      const product = TestDataFactory.createProduct();
      const result = Result.ok(product);

      jest.spyOn(getProductUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.getOne({ id: product.id });

      expect(response).toEqual(product);
      expect(getProductUseCase.execute).toHaveBeenCalledWith(product.id);
    });

    it('should preserve all product properties', async () => {
      const product = TestDataFactory.createProduct({
        name: 'Premium Product',
        description: 'Premium description',
        price: 99999,
        stock: 5,
      });
      const result = Result.ok(product);

      jest.spyOn(getProductUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.getOne({ id: product.id });

      expect(response.name).toBe('Premium Product');
      expect(response.description).toBe('Premium description');
      expect(response.price).toBe(99999);
      expect(response.stock).toBe(5);
    });

    it('should throw NotFound when product does not exist', async () => {
      const result = Result.fail<any>('Product not found');

      jest.spyOn(getProductUseCase, 'execute').mockResolvedValueOnce(result);

      try {
        await controller.getOne({ id: 'non-existent-id' });
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect((error as HttpException).getResponse()).toBe('Product not found');
      }
    });

    it('should throw NotFound with default message on generic error', async () => {
      const result = Result.fail<any>('Connection failed');

      jest.spyOn(getProductUseCase, 'execute').mockResolvedValueOnce(result);

      try {
        await controller.getOne({ id: 'some-id' });
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should call getProductUseCase.execute with correct id', async () => {
      const productId = 'test-id-123';
      const product = TestDataFactory.createProduct({ id: productId });
      const result = Result.ok(product);

      jest.spyOn(getProductUseCase, 'execute').mockResolvedValueOnce(result);

      await controller.getOne({ id: productId });

      expect(getProductUseCase.execute).toHaveBeenCalledWith(productId);
    });

    it('should handle multiple sequential requests', async () => {
      const product1 = TestDataFactory.createProduct({ name: 'Product 1' });
      const product2 = TestDataFactory.createProduct({ name: 'Product 2' });

      jest
        .spyOn(getProductUseCase, 'execute')
        .mockResolvedValueOnce(Result.ok(product1))
        .mockResolvedValueOnce(Result.ok(product2));

      const response1 = await controller.getOne({ id: product1.id });
      const response2 = await controller.getOne({ id: product2.id });

      expect(response1).toEqual(product1);
      expect(response2).toEqual(product2);
      expect(getProductUseCase.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration', () => {
    it('should work correctly after list call', async () => {
      const product = TestDataFactory.createProduct();

      jest
        .spyOn(listProductsUseCase, 'execute')
        .mockResolvedValueOnce(Result.ok([product]));

      jest.spyOn(getProductUseCase, 'execute').mockResolvedValueOnce(Result.ok(product));

      const listResponse = await controller.list();
      expect(listResponse).toHaveLength(1);

      const getResponse = await controller.getOne({ id: product.id });
      expect(getResponse).toEqual(product);
    });
  });
});
