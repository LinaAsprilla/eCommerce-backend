import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TransactionRepositoryPort } from "../../application/ports/transaction-repository.port";
import { TransactionOrm } from "../persistence/transaction.orm-entity";
import { Transaction } from "../../domain/transaction.entity";

@Injectable()
export class TransactionRepositoryAdapter implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrm)
    private readonly repo: Repository<TransactionOrm>
  ) { }

  async create(tx: Transaction): Promise<void> {
    const row = this.repo.create({
      id: tx.id,
      status: tx.status,
      amount: tx.amount,
      product: { id: tx.productId },
      providerTransactionId: tx.providerTransactionId ?? null,
    });
    await this.repo.save(row);
  }
}
