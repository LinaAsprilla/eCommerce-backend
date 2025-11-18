import { TransactionRepositoryPort } from '@/modules/transactions/application/ports/transaction-repository.port';
import { Transaction } from '@/modules/transactions/domain/transaction.entity';

export class MockTransactionRepository implements TransactionRepositoryPort {
  private readonly transactions: Map<string, Transaction> = new Map();

  create(tx: Transaction): Promise<void> {
    if (!tx.id) {
      return Promise.reject(new Error('Transaction ID is required'));
    }
    this.transactions.set(tx.id, tx);
    return Promise.resolve();
  }

  // Helper methods for testing
  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  clear(): void {
    this.transactions.clear();
  }

  getCount(): number {
    return this.transactions.size;
  }
}
