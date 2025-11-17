import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductOrm } from "./infrastructure/persistence/product.orm-entity";
import { ProductRepositoryAdapter } from "./infrastructure/adapters/product.repository.adapter";

import { ListProductsUseCase } from "./application/use-cases/list-products.use-case";
import { GetProductUseCase } from "./application/use-cases/get-product.use-case";
import { DecreaseStockUseCase } from "./application/use-cases/decrease-stock.use-case";

import { ProductsController } from "./interface/controllers/products.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrm])],

  controllers: [ProductsController],

  providers: [
    {
      provide: "ProductRepositoryPort",
      useClass: ProductRepositoryAdapter,
    },
    ListProductsUseCase,
    GetProductUseCase,
    DecreaseStockUseCase,
  ],

  exports: ["ProductRepositoryPort", DecreaseStockUseCase],
})
export class ProductsModule { }
