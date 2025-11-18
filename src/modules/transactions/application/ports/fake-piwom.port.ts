import { Card } from "../../domain/card.entity";
import { PaymentMethod } from "../../domain/payment-method.entity";

export interface CardTokenResponse {
  status: string;
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: string;
    exp_month: string;
    card_holder: string;
  };
}

export interface TransactionResponse {
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
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

export interface FakePiwomPort {
  tokenizeCard(card: Card): Promise<CardTokenResponse>;
  createTransaction(
    paymentMethod: PaymentMethod,
    amountInCents: number,
    reference: string,
  ): Promise<TransactionResponse>;
}
