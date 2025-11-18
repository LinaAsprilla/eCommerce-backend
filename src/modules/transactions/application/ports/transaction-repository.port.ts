import { Transaction } from "../../domain/transaction.entity";

export interface TransactionResponse {
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
  status_message: string | null;
}

export interface TransactionRepositoryPort {
  create(tx: Transaction): Promise<void>;
}
