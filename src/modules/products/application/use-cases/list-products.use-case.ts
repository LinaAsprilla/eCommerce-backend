import { Injectable, Inject } from "@nestjs/common";
import { ProductRepositoryPort } from "../ports/product-repository.port";
import { Result } from "@/shared/result";
import { Product } from "../../domain/product.entity";

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject("ProductRepositoryPort")
    private readonly productRepo: ProductRepositoryPort
  ) { }

  async execute(): Promise<Result<Product[]>> {
    try {
      const products = await this.productRepo.findAll();
      return Result.ok(products);
    } catch (e) {
      return Result.fail(e.message ?? "Error listing products");
    }
  }
}
