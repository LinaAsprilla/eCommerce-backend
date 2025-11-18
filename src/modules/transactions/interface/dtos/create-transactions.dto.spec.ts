import 'reflect-metadata';
import { validate } from 'class-validator';
import { CardInfoDTO, PaymentMethodDTO, CreateTransactionsDTO } from './create-transactions.dto';
import { plainToClass } from 'class-transformer';

// Simple tests focused on DTO validation with valid data
describe('CardInfoDTO', () => {
  describe('validation', () => {
    it('should validate a valid CardInfoDTO', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when card_number is missing', async () => {
      const dto = plainToClass(CardInfoDTO, {
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_number');
    });

    it('should fail validation when card_number contains non-digits', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242-4242-4242-4242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_number');
    });

    it('should fail validation when card_number is too short', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_number');
    });

    it('should fail validation when card_number is too long', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '42424242424242420000',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_number');
    });

    it('should fail validation when cvc is missing', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('cvc');
    });

    it('should fail validation when cvc contains non-digits', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: 'abc',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('cvc');
    });

    it('should fail validation when cvc is too short', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '12',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('cvc');
    });

    it('should fail validation when cvc is too long', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '12345',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('cvc');
    });

    it('should fail validation when exp_month is missing', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('exp_month');
    });

    it('should fail validation when exp_month is invalid', async () => {
      const invalidMonths = ['00', '13', '99', '1', '99'];
      for (const month of invalidMonths) {
        const dto = plainToClass(CardInfoDTO, {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: month,
          exp_year: '25',
          card_holder: 'John Doe',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('exp_month');
      }
    });

    it('should accept valid exp_months', async () => {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const dto = plainToClass(CardInfoDTO, {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: monthStr,
          exp_year: '25',
          card_holder: 'John Doe',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation when exp_year is missing', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('exp_year');
    });

    it('should fail validation when exp_year contains non-digits', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: 'ab',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('exp_year');
    });

    it('should fail validation when exp_year is not exactly 2 digits', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '5',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('exp_year');
    });

    it('should fail validation when card_holder is missing', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_holder');
    });

    it('should fail validation when card_holder is empty', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_holder');
    });

    it('should fail validation when card_holder is too short', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'Jo',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_holder');
    });

    it('should fail validation when card_holder contains invalid characters', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe 123',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('card_holder');
    });

    it('should accept card_holder with accents', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'José María',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid 3-digit cvc', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid 4-digit cvc', async () => {
      const dto = plainToClass(CardInfoDTO, {
        card_number: '4242424242424242',
        cvc: '1234',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});

describe('PaymentMethodDTO', () => {
  describe('validation', () => {
    it('should validate a valid PaymentMethodDTO', async () => {
      const dto = plainToClass(PaymentMethodDTO, {
        type: 'CARD',
        installments: 1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when type is missing', async () => {
      const dto = plainToClass(PaymentMethodDTO, {
        installments: 1,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });

    it('should fail validation when installments is missing', async () => {
      const dto = plainToClass(PaymentMethodDTO, {
        type: 'CARD',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('installments');
    });

    it('should accept different installment values', async () => {
      for (let i = 1; i <= 12; i++) {
        const dto = plainToClass(PaymentMethodDTO, {
          type: 'CARD',
          installments: i,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });
});

describe('CreateTransactionsDTO', () => {
  describe('validation', () => {
    it('should validate a valid CreateTransactionsDTO', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
        reference: 'ref-123',
        product_id: 'prod-123',
        quantity: 1,
      });

      const errors = await validate(dto, { skipMissingProperties: false });

      expect(errors).toHaveLength(0);
    });

    it('should validate CreateTransactionsDTO with optional fields', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
        reference: 'ref-123',
        product_id: 'prod-123',
        quantity: 1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should handle optional fields correctly', async () => {
      const dtoWithAllFields = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
        reference: 'ref-123',
        product_id: 'prod-123',
        quantity: 1,
      });

      const errors = await validate(dtoWithAllFields);

      expect(errors).toHaveLength(0);
    });

    it('should validate with various amounts', async () => {
      const amounts = [1, 100, 10000, 1000000];

      for (const amount of amounts) {
        const dto = plainToClass(CreateTransactionsDTO, {
          infoCard: {
            card_number: '4242424242424242',
            cvc: '123',
            exp_month: '12',
            exp_year: '25',
            card_holder: 'John Doe',
          },
          paymentMethod: {
            type: 'CARD',
            installments: 1,
          },
          amount: amount,
          reference: 'ref-123',
          product_id: 'prod-123',
          quantity: 1,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation when amount is missing', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        reference: 'ref-123',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const amountErrors = errors.filter(e => e.property === 'amount');
      expect(amountErrors.length).toBeGreaterThan(0);
    });

    it('should fail validation when reference is missing', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const referenceErrors = errors.filter(e => e.property === 'reference');
      expect(referenceErrors.length).toBeGreaterThan(0);
    });

    it('should fail validation when reference is not a string', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
        reference: 123,
      });

      const errors = await validate(dto, { skipMissingProperties: false });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('reference');
    });

    it('should validate with nested infoCard validation', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
        reference: 'ref-123',
        product_id: 'prod-123',
        quantity: 1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with nested paymentMethod validation', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 3,
        },
        amount: 10000,
        reference: 'ref-123',
        product_id: 'prod-123',
        quantity: 1,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with product_id and quantity', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
        reference: 'ref-123',
        product_id: 'prod-123',
        quantity: 5,
      });

      const errors = await validate(dto, { skipMissingProperties: false });

      expect(errors).toHaveLength(0);
    });

    it('should accept quantity as decimal', async () => {
      const dto = plainToClass(CreateTransactionsDTO, {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: {
          type: 'CARD',
          installments: 1,
        },
        amount: 10000,
        reference: 'ref-123',
        product_id: 'prod-123',
        quantity: 1.5,
      });

      const errors = await validate(dto, { skipMissingProperties: false });

      expect(errors).toHaveLength(0);
    });
  });
});
