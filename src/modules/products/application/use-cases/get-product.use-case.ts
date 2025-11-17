import { Injectable, Inject } from "@nestjs/common";
import { ProductRepositoryPort } from "../ports/product-repository.port";
import { Result } from "../../../../shared/result";
import { Product } from "../../domain/product.entity";

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject("ProductRepositoryPort")
    private readonly productRepo: ProductRepositoryPort
  ) { }

  async execute(id: string): Promise<Result<Product>> {
    try {
      const product = await this.productRepo.findById(id);

      if (!product) {
        return Result.fail("Product not found");
      }

      return Result.ok(product);
    } catch (e) {
      return Result.fail(e.message ?? "Error getting product");
    }
  }
}
