import { Product } from '@/modules/products/domain/product.entity';
import { Card } from '@/modules/transactions/domain/card.entity';
import { PaymentMethod } from '@/modules/transactions/domain/payment-method.entity';
import { Transaction } from '@/modules/transactions/domain/transaction.entity';
import { randomUUID } from 'node:crypto';

/**
 * Factory methods for creating test data
 */
export class TestDataFactory {
  /**
   * Creates a valid test product
   */
  static createProduct(overrides?: Partial<Product>): Product {
    const defaults = {
      id: randomUUID(),
      name: 'Test Product',
      description: 'A test product for unit tests',
      price: 10000, // 100 COP
      stock: 100,
      ...overrides,
    };

    return new Product(
      defaults.id,
      defaults.name,
      defaults.description,
      defaults.price,
      defaults.stock,
    );
  }

  /**
   * Creates a valid test Visa card
   */
  static createCard(overrides?: Partial<Card>): Card {
    const currentDate = new Date();
    const nextYear = currentDate.getFullYear() + 1;
    const expYear = (nextYear - 2000).toString().padStart(2, '0');
    const expMonth = '12';

    const defaults = {
      cardNumber: '4242424242424242', // Valid Visa test number
      cvc: '123',
      expMonth: expMonth,
      expYear: expYear,
      cardHolder: 'Test Holder',
      ...overrides,
    };

    return new Card(
      defaults.cardNumber,
      defaults.cvc,
      defaults.expMonth,
      defaults.expYear,
      defaults.cardHolder,
    );
  }

  /**
   * Creates an expired card for testing validation
   */
  static createExpiredCard(): Card {
    return new Card(
      '4242424242424242',
      '123',
      '01',
      '20', // Expired year
      'Test Holder',
    );
  }

  /**
   * Creates a card with invalid Luhn number
   */
  static createInvalidLuhnCard(): Card {
    return new Card(
      '4242424242424241', // Invalid Luhn
      '123',
      '12',
      '25',
      'Test Holder',
    );
  }

  /**
   * Creates a Mastercard
   */
  static createMastercardCard(): Card {
    return new Card(
      '5555555555554444', // Valid Mastercard
      '123',
      '12',
      '25',
      'Test Holder',
    );
  }

  /**
   * Creates a valid payment method
   */
  static createPaymentMethod(overrides?: Partial<PaymentMethod>): PaymentMethod {
    const defaults = {
      type: 'CARD' as const,
      installments: 1,
      ...overrides,
    };

    return new PaymentMethod(defaults.type, defaults.installments);
  }

  /**
   * Creates a transaction
   */
  static createTransaction(overrides?: Partial<Transaction>): Transaction {
    const defaults = {
      infoCard: this.createCard(),
      paymentMethod: this.createPaymentMethod(),
      amount: 10000,
      reference: 'ref_' + randomUUID(),
      productId: randomUUID(),
      quantity: 1,
      id: randomUUID(),
      status: 'APPROVED',
      providerTransactionId: 'txn_' + randomUUID(),
      ...overrides,
    };

    return new Transaction(
      defaults.infoCard,
      defaults.paymentMethod,
      defaults.amount,
      defaults.reference,
      defaults.productId,
      defaults.id,
      defaults.status,
      defaults.providerTransactionId,
      defaults.quantity,
    );
  }
}
