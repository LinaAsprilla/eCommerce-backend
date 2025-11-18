import { Card } from '@/modules/transactions/domain/card.entity';
import { PaymentMethod } from '@/modules/transactions/domain/payment-method.entity';
import { CardTokenResponse, FakePiwomPort } from '@/modules/transactions/application/ports/fake-piwom.port';

export interface FakePiwomResponse {
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
  data: {
    id: string;
    created_at: string;
    amount_in_cents: number;
    reference: string;
    currency: string;
    payment_method_type: string;
    payment_method: {
      type: string;
      installments: number;
      extra?: {
        name: string;
        brand: string;
        last_four: string;
        processor_response_code?: string;
      };
    };
    status: string;
    status_message: string | null;
    merchant: {
      id: number;
      name: string;
      legal_name: string;
      contact_name: string;
      phone_number: string;
      logo_url: string | null;
      legal_id_type: string;
      email: string;
      legal_id: string;
    };
  };
}

export class MockFakePiwom implements FakePiwomPort {
  private tokenizeCardFail = false;
  private createTransactionFail = false;
  private tokenizeCardStatus: 'APPROVED' | 'DECLINED' | 'ERROR' = 'APPROVED';
  private transactionStatus: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING' = 'APPROVED';

  async tokenizeCard(card: Card): Promise<CardTokenResponse> {
    if (this.tokenizeCardFail) {
      return Promise.reject(new Error('Failed to tokenize card'));
    }

    return Promise.resolve({
      status: this.tokenizeCardStatus,
      data: {
        id: 'tok_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        brand: card.getCardType(),
        name: card.generateCardName(),
        last_four: card.getLastFour(),
        bin: card.getBin(),
        exp_year: card.expYear,
        exp_month: card.expMonth,
        card_holder: card.cardHolder,
      },
    });
  }

  async createTransaction(
    paymentMethod: PaymentMethod,
    amountInCents: number,
    reference: string,
  ): Promise<FakePiwomResponse> {
    if (this.createTransactionFail) {
      return Promise.reject(new Error('Failed to create transaction'));
    }

    return Promise.resolve({
      status: this.transactionStatus,
      data: {
        id: 'txn_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        amount_in_cents: amountInCents,
        reference: reference,
        currency: 'COP',
        payment_method_type: paymentMethod.type,
        payment_method: {
          type: paymentMethod.type,
          installments: paymentMethod.installments,
          extra: {
            name: 'Test Card',
            brand: 'VISA',
            last_four: '4242',
          },
        },
        status: this.transactionStatus,
        status_message: this.transactionStatus === 'APPROVED' ? 'Transaction approved' : 'Transaction declined',
        merchant: {
          id: 1,
          name: 'Test Merchant',
          legal_name: 'Test Merchant LLC',
          contact_name: 'John Doe',
          phone_number: '1234567890',
          logo_url: null,
          legal_id_type: 'CC',
          email: 'test@example.com',
          legal_id: '1234567890',
        },
      },
    });
  }

  // Helper methods for testing
  setTokenizeCardFail(fail: boolean): void {
    this.tokenizeCardFail = fail;
  }

  setCreateTransactionFail(fail: boolean): void {
    this.createTransactionFail = fail;
  }

  setTokenizeCardStatus(status: 'APPROVED' | 'DECLINED' | 'ERROR'): void {
    this.tokenizeCardStatus = status;
  }

  setTransactionStatus(status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'): void {
    this.transactionStatus = status;
  }
}
