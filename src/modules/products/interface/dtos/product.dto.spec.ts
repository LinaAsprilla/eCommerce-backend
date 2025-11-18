import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { plainToClass } from 'class-transformer';

describe('CreateProductDto', () => {
  describe('validation', () => {
    it('should validate a valid CreateProductDto', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when name is missing', async () => {
      const dto = plainToClass(CreateProductDto, {
        description: 'A test product',
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name is empty string', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: '',
        description: 'A test product',
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name exceeds max length', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'a'.repeat(201),
        description: 'A test product',
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name is not a string', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 123,
        description: 'A test product',
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when description is missing', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });

    it('should fail validation when description exceeds max length', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'a'.repeat(1001),
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });

    it('should fail validation when price is missing', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation when price is not a number', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: 'not a number',
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation when price is negative', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: -100,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation when stock is missing', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: 10000,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('stock');
    });

    it('should fail validation when stock is not a number', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: 10000,
        stock: 'not a number',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('stock');
    });

    it('should fail validation when stock is negative', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: 10000,
        stock: -50,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('stock');
    });

    it('should accept price of 0', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: 0,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept stock of 0', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'A test product',
        price: 10000,
        stock: 0,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept name at max length boundary', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'a'.repeat(200),
        description: 'A test product',
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept description at max length boundary', async () => {
      const dto = plainToClass(CreateProductDto, {
        name: 'Test Product',
        description: 'a'.repeat(1000),
        price: 10000,
        stock: 100,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});

describe('UpdateProductDto', () => {
  describe('validation', () => {
    it('should validate an empty UpdateProductDto', async () => {
      const dto = plainToClass(UpdateProductDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with only name field', async () => {
      const dto = plainToClass(UpdateProductDto, {
        name: 'Updated Product',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with only description field', async () => {
      const dto = plainToClass(UpdateProductDto, {
        description: 'Updated description',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with only price field', async () => {
      const dto = plainToClass(UpdateProductDto, {
        price: 20000,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with only stock field', async () => {
      const dto = plainToClass(UpdateProductDto, {
        stock: 200,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with all fields', async () => {
      const dto = plainToClass(UpdateProductDto, {
        name: 'Updated Product',
        description: 'Updated description',
        price: 20000,
        stock: 200,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when name exceeds max length', async () => {
      const dto = plainToClass(UpdateProductDto, {
        name: 'a'.repeat(201),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when description exceeds max length', async () => {
      const dto = plainToClass(UpdateProductDto, {
        description: 'a'.repeat(1001),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });

    it('should fail validation when name is not a string', async () => {
      const dto = plainToClass(UpdateProductDto, {
        name: 123,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when description is not a string', async () => {
      const dto = plainToClass(UpdateProductDto, {
        description: 123,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });

    it('should fail validation when price is not a number', async () => {
      const dto = plainToClass(UpdateProductDto, {
        price: 'not a number',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation when price is negative', async () => {
      const dto = plainToClass(UpdateProductDto, {
        price: -100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation when stock is not a number', async () => {
      const dto = plainToClass(UpdateProductDto, {
        stock: 'not a number',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('stock');
    });

    it('should fail validation when stock is negative', async () => {
      const dto = plainToClass(UpdateProductDto, {
        stock: -50,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('stock');
    });

    it('should accept name at max length boundary', async () => {
      const dto = plainToClass(UpdateProductDto, {
        name: 'a'.repeat(200),
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept price of 0', async () => {
      const dto = plainToClass(UpdateProductDto, {
        price: 0,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept stock of 0', async () => {
      const dto = plainToClass(UpdateProductDto, {
        stock: 0,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
