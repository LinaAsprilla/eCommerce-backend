import { Module } from "@nestjs/common";
import { FakePiwomAdapter } from "./infrastructure/adapters/fake-piwom.adapter";
import { TransactionsController } from "./interface/controllers/transactions.controller";
import { CreateTransactionsUseCase } from "./application/use-cases/create-transactions.use-case";
import { TransactionRepositoryAdapter } from "./infrastructure/adapters/transaction.repository.adapter";
import { TransactionOrm } from "./infrastructure/persistence/transaction.orm-entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductRepositoryAdapter } from "../products/infrastructure/adapters/product.repository.adapter";
import { ProductOrm } from "../products/infrastructure/persistence/product.orm-entity";

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrm, ProductOrm])],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionsUseCase,
    {
      provide: "FakePiwomPort",
      useClass: FakePiwomAdapter,
    },
    {
      provide: "TransactionRepositoryPort",
      useClass: TransactionRepositoryAdapter,
    },
    {
      provide: "ProductRepositoryPort",
      useClass: ProductRepositoryAdapter,
    },
  ],
  exports: ["FakePiwomPort"],
})
export class TransactionsModule { }
