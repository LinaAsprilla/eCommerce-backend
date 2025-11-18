import { Injectable, Inject } from "@nestjs/common";
import { Result } from "@/shared/result";
import { TransactionRepositoryPort, TransactionResponse } from "../ports/transaction-repository.port";
import { FakePiwomPort } from "../ports/fake-piwom.port";
import { Transaction } from "../../domain/transaction.entity";
import { ProductRepositoryPort } from "@/modules/products/application/ports/product-repository.port";
import { randomUUID } from "node:crypto";


@Injectable()
export class CreateTransactionsUseCase {
  constructor(
    @Inject("TransactionRepositoryPort")
    private readonly repo: TransactionRepositoryPort,
    @Inject("FakePiwomPort")
    private readonly fakePiwom: FakePiwomPort,
    @Inject("ProductRepositoryPort")
    private readonly productRepo: ProductRepositoryPort
  ) { }

  async execute(input: Transaction): Promise<Result<TransactionResponse>> {
    const { infoCard, paymentMethod, amount, reference, productId, quantity } = input;
    try {
      if (productId) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
          return Result.fail('Product not found');
        }
        if (amount < product.price) {
          return Result.fail(`Amount must be greater than or equal to product price: ${product.price}`);
        }
      }

      const { data: tokenCard } = await this.fakePiwom.tokenizeCard(infoCard);
      if (!tokenCard) {
        return Result.fail('Error tokenizing card');
      }

      paymentMethod.token = tokenCard.id;

      const txResponse = await this.fakePiwom.createTransaction(paymentMethod, amount, reference);

      if (!txResponse) {
        return Result.fail('Error creating transaction with payment provider');
      }
      await this.productRepo.decreaseStock(productId, quantity);

      await this.repo.create(new Transaction(
        infoCard,
        paymentMethod,
        amount,
        reference,
        productId,
        randomUUID(),
        txResponse.status,
        txResponse.data.id
      ));

      return Result.ok({
        status: txResponse.status,
        status_message: txResponse.data.status_message
      });

    } catch (e) {
      return Result.fail(e.message ?? "Error creating transaction");
    }
  }
}
