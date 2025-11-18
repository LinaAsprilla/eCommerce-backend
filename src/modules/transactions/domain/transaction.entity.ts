import { Card } from "./card.entity";
import { PaymentMethod } from "./payment-method.entity";


export class Transaction {
  constructor(
    public infoCard: Card,
    public paymentMethod: PaymentMethod,
    public amount: number,
    public reference: string,
    public productId?: string,
    public id?: string,
    public status?: string,
    public providerTransactionId?: string,
    public quantity?: number
  ) { }
}
