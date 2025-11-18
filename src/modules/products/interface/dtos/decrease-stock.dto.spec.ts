import 'reflect-metadata';
import { validate } from 'class-validator';
import { DecreaseStockDto } from './decrease-stock.dto';
import { plainToClass } from 'class-transformer';

describe('DecreaseStockDto', () => {
  describe('validation', () => {
    it('should validate with valid quantity', async () => {
      const dto = plainToClass(DecreaseStockDto, {
        quantity: 5,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail when quantity is missing', async () => {
      const dto = plainToClass(DecreaseStockDto, {});

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when quantity is not a number', async () => {
      const dto = plainToClass(DecreaseStockDto, {
        quantity: 'five',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when quantity is zero or negative', async () => {
      const dtoZero = plainToClass(DecreaseStockDto, {
        quantity: 0,
      });

      const dtoNegative = plainToClass(DecreaseStockDto, {
        quantity: -5,
      });

      const errorsZero = await validate(dtoZero);
      const errorsNegative = await validate(dtoNegative);

      expect(errorsZero.length).toBeGreaterThan(0);
      expect(errorsNegative.length).toBeGreaterThan(0);
    });

    it('should accept decimal quantity', async () => {
      const dto = plainToClass(DecreaseStockDto, {
        quantity: 2.5,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept large quantity values', async () => {
      const dto = plainToClass(DecreaseStockDto, {
        quantity: 999999,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
