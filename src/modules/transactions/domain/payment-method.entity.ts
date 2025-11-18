export type PaymentType = "CARD" | "BANCOLOMBIA_TRANSFER" | "BANCOLOMBIA_QR" | "NEQUI" | "PSE";

export class PaymentMethod {
  constructor(
    public readonly type: PaymentType,
    public readonly installments: number,
    public token?: string,
  ) { }
}