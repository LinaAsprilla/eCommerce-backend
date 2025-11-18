import { Test, TestingModule } from '@nestjs/testing';
import { FakePiwomAdapter } from './fake-piwom.adapter';
import { TestDataFactory } from '@/shared/test-helpers/test-data-factory';

describe('FakePiwomAdapter', () => {
  let adapter: FakePiwomAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FakePiwomAdapter],
    }).compile();

    adapter = module.get<FakePiwomAdapter>(FakePiwomAdapter);
  });

  describe('tokenizeCard', () => {
    it('should generate a valid token response', async () => {
      const card = TestDataFactory.createCard();

      const response = await adapter.tokenizeCard(card);

      expect(response).toBeDefined();
      expect(response.status).toBe('CREATED');
      expect(response.data).toBeDefined();
      expect(response.data.id).toBeDefined();
      expect(response.data.created_at).toBeDefined();
    });

    it('should generate token with correct format (tok_prod_1_)', async () => {
      const card = TestDataFactory.createCard();

      const response = await adapter.tokenizeCard(card);

      expect(response.data.id).toMatch(/^tok_prod_1_[0-9A-Fa-f]{32}$/);
    });

    it('should generate unique tokens on each call', async () => {
      const card = TestDataFactory.createCard();

      const response1 = await adapter.tokenizeCard(card);
      const response2 = await adapter.tokenizeCard(card);

      expect(response1.data.id).not.toBe(response2.data.id);
    });

    it('should include correct card information in token response', async () => {
      const card = TestDataFactory.createCard({
        cardNumber: '4242424242424242',
        expMonth: '12',
        expYear: '25',
        cardHolder: 'John Doe',
      });

      const response = await adapter.tokenizeCard(card);

      expect(response.data.brand).toBe(card.getCardType());
      expect(response.data.name).toBe(card.generateCardName());
      expect(response.data.last_four).toBe(card.getLastFour());
      expect(response.data.bin).toBe(card.getBin());
      expect(response.data.exp_year).toBe('25');
      expect(response.data.exp_month).toBe('12');
      expect(response.data.card_holder).toBe('John Doe');
    });

    it('should include ISO timestamp for created_at', async () => {
      const card = TestDataFactory.createCard();
      const beforeRequest = new Date();

      const response = await adapter.tokenizeCard(card);

      const tokenCreatedAt = new Date(response.data.created_at);
      const afterRequest = new Date();

      expect(tokenCreatedAt.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(tokenCreatedAt.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });

    it('should handle Visa card tokenization', async () => {
      const visaCard = TestDataFactory.createCard({
        cardNumber: '4242424242424242',
      });

      const response = await adapter.tokenizeCard(visaCard);

      expect(response.data.brand).toBe('VISA');
    });

    it('should handle Mastercard card tokenization', async () => {
      const mastercardCard = TestDataFactory.createMastercardCard();

      const response = await adapter.tokenizeCard(mastercardCard);

      expect(response.data.brand).toBe('MASTERCARD');
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction response with required fields', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.id).toBeDefined();
      expect(response.data.created_at).toBeDefined();
      expect(response.data.amount_in_cents).toBe(10000);
      expect(response.data.reference).toBe('ref-123');
    });

    it('should generate transaction ID with correct format', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(response.data.id).toMatch(/^\d{4}-\d+-\d{5}$/);
    });

    it('should generate unique transaction IDs', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response1 = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-1',
      );
      const response2 = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-2',
      );

      expect(response1.data.id).not.toBe(response2.data.id);
    });

    it('should return DECLINED status for amount > $5,000,000 COP', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        500000001, // > 5,000,000
        'ref-123',
      );

      expect(response.status).toBe('DECLINED');
    });

    it('should return DECLINED status for amount < $100 COP', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        99, // < 100
        'ref-123',
      );

      expect(response.status).toBe('DECLINED');
    });

    it('should return APPROVED or DECLINED status for valid amounts', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(['APPROVED', 'DECLINED']).toContain(response.status);
    });

    it('should include correct amount in transaction response', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();
      const amount = 25000;

      const response = await adapter.createTransaction(
        paymentMethod,
        amount,
        'ref-123',
      );

      expect(response.data.amount_in_cents).toBe(amount);
    });

    it('should include payment method information', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod({
        type: 'CARD',
        installments: 3,
      });

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(response.data.payment_method_type).toBe('CARD');
      expect(response.data.payment_method.type).toBe('CARD');
      expect(response.data.payment_method.installments).toBe(3);
    });

    it('should include card extra information', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(response.data.payment_method.extra.name).toBeDefined();
      expect(response.data.payment_method.extra.brand).toBeDefined();
      expect(response.data.payment_method.extra.last_four).toBeDefined();
      expect(response.data.payment_method.extra.processor_response_code).toBeDefined();
    });

    it('should include merchant information', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(response.data.merchant).toBeDefined();
      expect(response.data.merchant.id).toBe(1);
      expect(response.data.merchant.name).toBe('Test Merchant');
    });

    it('should include currency as COP', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(response.data.currency).toBe('COP');
    });

    it('should include ISO timestamp for created_at', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();
      const beforeRequest = new Date();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      const txCreatedAt = new Date(response.data.created_at);
      const afterRequest = new Date();

      expect(txCreatedAt.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(txCreatedAt.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });

    it('should generate APPROVED processor response codes', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      let hasApprovedCode = false;
      for (let i = 0; i < 50; i++) {
        const response = await adapter.createTransaction(
          paymentMethod,
          10000,
          `ref-${i}`,
        );

        if (response.status === 'APPROVED') {
          expect(['00', '01', '02']).toContain(
            response.data.payment_method.extra.processor_response_code,
          );
          hasApprovedCode = true;
          break;
        }
      }

      expect(hasApprovedCode).toBe(true);
    });

    it('should generate DECLINED processor response codes', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        500000001, // Force decline
        'ref-123',
      );

      expect(['51', '05', '14']).toContain(
        response.data.payment_method.extra.processor_response_code,
      );
    });

    it('should include correct status message for APPROVED', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      let foundApproved = false;
      for (let i = 0; i < 50; i++) {
        const response = await adapter.createTransaction(
          paymentMethod,
          10000,
          `ref-${i}`,
        );

        if (response.status === 'APPROVED') {
          expect(response.data.status_message).toBe('Transacción aprobada');
          foundApproved = true;
          break;
        }
      }

      expect(foundApproved).toBe(true);
    });

    it('should include correct status message for DECLINED', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        500000001, // Force decline
        'ref-123',
      );

      expect(response.data.status_message).toBe('Fondos Insuficientes');
    });

    it('should preserve payment method token in response', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      expect(response.data.payment_method).toBeDefined();
      expect(response.data.payment_method.type).toBe(paymentMethod.type);
    });

    it('should handle minimum valid amount (100 cents)', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        100, // Exactly 100
        'ref-123',
      );

      expect(['APPROVED', 'DECLINED']).toContain(response.status);
    });

    it('should handle maximum valid amount (500000000 cents = $5,000,000)', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        500000000, // Exactly 500000000
        'ref-123',
      );

      expect(['APPROVED', 'DECLINED']).toContain(response.status);
    });
  });

  describe('processor response codes', () => {
    it('should generate consistent response codes for given status', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      for (let i = 0; i < 20; i++) {
        const response = await adapter.createTransaction(
          paymentMethod,
          500000001, // Always DECLINED
          `ref-${i}`,
        );

        expect(['51', '05', '14']).toContain(
          response.data.payment_method.extra.processor_response_code,
        );
      }
    });
  });

  describe('transaction reference handling', () => {
    it('should preserve the provided reference', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();
      const reference = 'unique-ref-abc-123';

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        reference,
      );

      expect(response.data.reference).toBe(reference);
    });

    it('should handle different reference formats', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();
      const references = ['ref-1', 'order-123', 'order_456', 'ref_789_test'];

      for (const ref of references) {
        const response = await adapter.createTransaction(
          paymentMethod,
          10000,
          ref,
        );

        expect(response.data.reference).toBe(ref);
      }
    });
  });

  describe('card brand simulation', () => {
    it('should extract card brand information', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      const brand = response.data.payment_method.extra.brand;
      expect(['VISA', 'MASTERCARD', 'AMEX']).toContain(brand);
    });

    it('should generate random last four digits', async () => {
      const paymentMethod = TestDataFactory.createPaymentMethod();

      const response = await adapter.createTransaction(
        paymentMethod,
        10000,
        'ref-123',
      );

      const lastFour = response.data.payment_method.extra.last_four;
      expect(lastFour).toMatch(/^\d{4}$/);
    });
  });
});
