import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionsUseCase } from '../../application/use-cases/create-transactions.use-case';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';
import { Result } from '@/shared/result';
import { Card } from '../../domain/card.entity';
import { TransactionResponse } from '../../application/ports/transaction-repository.port';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let createTransactionsUseCase: CreateTransactionsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: CreateTransactionsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    createTransactionsUseCase = module.get<CreateTransactionsUseCase>(CreateTransactionsUseCase);
  });

  describe('pay', () => {
    it('should create a transaction successfully', async () => {
      const product = TestDataFactory.createProduct();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: paymentMethod,
        amount: 10000,
        reference: 'ref_123',
        product_id: product.id,
        quantity: 1,
      };

      const result = Result.ok<TransactionResponse>({
        status: 'APPROVED',
        status_message: 'Transaction approved',
      });

      jest.spyOn(createTransactionsUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.pay(dto);

      expect(response.status).toBe('APPROVED');
      expect(response.status_message).toBe('Transaction approved');
      expect(createTransactionsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should call execute with correct transaction object', async () => {
      const product = TestDataFactory.createProduct();
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: paymentMethod,
        amount: 10000,
        reference: 'ref_123',
        product_id: product.id,
        quantity: 1,
      };

      jest
        .spyOn(createTransactionsUseCase, 'execute')
        .mockResolvedValueOnce(
          Result.ok({ status: 'APPROVED', status_message: 'Transaction approved' }) as any,
        );

      await controller.pay(dto);

      const callArgs = (createTransactionsUseCase.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs.infoCard).toBeInstanceOf(Card);
      expect(callArgs.infoCard.cardNumber).toBe('4242424242424242');
      expect(callArgs.paymentMethod).toBe(paymentMethod);
      expect(callArgs.amount).toBe(10000);
      expect(callArgs.reference).toBe('ref_123');
      expect(callArgs.productId).toBe(product.id);
      expect(callArgs.quantity).toBe(1);
    });

    it('should create Card from DTO', async () => {
      const dto = {
        infoCard: {
          card_number: '5555555555554444',
          cvc: '456',
          exp_month: '06',
          exp_year: '26',
          card_holder: 'Jane Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 20000,
        reference: 'ref_456',
        product_id: 'prod_123',
        quantity: 2,
      };

      jest
        .spyOn(createTransactionsUseCase, 'execute')
        .mockResolvedValueOnce(
          Result.ok({ status: 'APPROVED', status_message: 'Transaction approved' }) as any,
        );

      await controller.pay(dto);

      const callArgs = (createTransactionsUseCase.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs.infoCard.cardNumber).toBe('5555555555554444');
      expect(callArgs.infoCard.cvc).toBe('456');
      expect(callArgs.infoCard.expMonth).toBe('06');
      expect(callArgs.infoCard.expYear).toBe('26');
      expect(callArgs.infoCard.cardHolder).toBe('Jane Doe');
    });

    it('should throw BadRequest when transaction fails', async () => {
      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 10000,
        reference: 'ref_123',
        product_id: 'non-existent',
        quantity: 1,
      };

      const result = Result.fail('Product not found');

      jest.spyOn(createTransactionsUseCase, 'execute').mockResolvedValueOnce(result as any);

      try {
        await controller.pay(dto);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect((error as HttpException).getResponse()).toBe('Product not found');
      }
    });

    it('should throw BadRequest with correct error message', async () => {
      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 5000,
        reference: 'ref_123',
        product_id: 'prod_123',
        quantity: 1,
      };

      const errorMessage = 'Amount must be greater than or equal to product price: 10000';
      const result = Result.fail(errorMessage);

      jest.spyOn(createTransactionsUseCase, 'execute').mockResolvedValueOnce(result as any);

      try {
        await controller.pay(dto);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getResponse()).toContain('Amount must be greater');
      }
    });

    it('should handle PENDING status', async () => {
      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 10000,
        reference: 'ref_123',
        product_id: 'prod_123',
        quantity: 1,
      };

      const result = Result.ok<TransactionResponse>({
        status: 'PENDING',
        status_message: 'Transaction is pending',
      });

      jest.spyOn(createTransactionsUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.pay(dto);

      expect(response.status).toBe('PENDING');
    });

    it('should handle DECLINED status', async () => {
      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 10000,
        reference: 'ref_123',
        product_id: 'prod_123',
        quantity: 1,
      };

      const result = Result.ok<TransactionResponse>({
        status: 'DECLINED',
        status_message: 'Card declined',
      });

      jest.spyOn(createTransactionsUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.pay(dto);

      expect(response.status).toBe('DECLINED');
    });

    it('should handle multiple sequential transactions', async () => {
      const dto1 = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 10000,
        reference: 'ref_1',
        product_id: 'prod_1',
        quantity: 1,
      };

      const dto2 = {
        infoCard: {
          card_number: '5555555555554444',
          cvc: '456',
          exp_month: '06',
          exp_year: '26',
          card_holder: 'Jane Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 20000,
        reference: 'ref_2',
        product_id: 'prod_2',
        quantity: 2,
      };

      jest
        .spyOn(createTransactionsUseCase, 'execute')
        .mockResolvedValueOnce(
          Result.ok<TransactionResponse>({ status: 'APPROVED', status_message: 'Transaction approved' }),
        )
        .mockResolvedValueOnce(
          Result.ok<TransactionResponse>({ status: 'APPROVED', status_message: 'Transaction approved' }),
        );

      const response1 = await controller.pay(dto1);
      const response2 = await controller.pay(dto2);

      expect(response1.status).toBe('APPROVED');
      expect(response2.status).toBe('APPROVED');
      expect(createTransactionsUseCase.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle transaction with different card types', async () => {
      const dtoVisa = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'Test User',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 10000,
        reference: 'visa_ref',
        product_id: 'prod_123',
        quantity: 1,
      };

      const dtoMastercard = {
        infoCard: {
          card_number: '5555555555554444',
          cvc: '456',
          exp_month: '06',
          exp_year: '26',
          card_holder: 'Test User',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 15000,
        reference: 'mc_ref',
        product_id: 'prod_456',
        quantity: 1,
      };

      jest
        .spyOn(createTransactionsUseCase, 'execute')
        .mockResolvedValueOnce(
          Result.ok<TransactionResponse>({ status: 'APPROVED', status_message: 'Transaction approved' }),
        )
        .mockResolvedValueOnce(
          Result.ok<TransactionResponse>({ status: 'APPROVED', status_message: 'Transaction approved' }),
        );

      const responseVisa = await controller.pay(dtoVisa);
      const responseMastercard = await controller.pay(dtoMastercard);

      expect(responseVisa.status).toBe('APPROVED');
      expect(responseMastercard.status).toBe('APPROVED');
    });

    it('should preserve response data structure', async () => {
      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 10000,
        reference: 'ref_123',
        product_id: 'prod_123',
        quantity: 1,
      };

      const result = Result.ok<TransactionResponse>({
        status: 'APPROVED',
        status_message: 'Transaction has been approved successfully',
      });

      jest.spyOn(createTransactionsUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.pay(dto);

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('status_message');
      expect(response.status).toBe('APPROVED');
      expect(response.status_message).toBe('Transaction has been approved successfully');
    });

    it('should handle null status_message', async () => {
      const dto = {
        infoCard: {
          card_number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        paymentMethod: TestDataFactory.createPaymentMethod(),
        amount: 10000,
        reference: 'ref_123',
        product_id: 'prod_123',
        quantity: 1,
      };

      const result = Result.ok<TransactionResponse>({
        status: 'ERROR',
        status_message: null,
      });

      jest.spyOn(createTransactionsUseCase, 'execute').mockResolvedValueOnce(result);

      const response = await controller.pay(dto);

      expect(response.status).toBe('ERROR');
      expect(response.status_message).toBeNull();
    });
  });
});
