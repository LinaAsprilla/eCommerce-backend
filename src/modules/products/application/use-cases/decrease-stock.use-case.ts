import { Injectable, Inject } from "@nestjs/common";
import { ProductRepositoryPort } from "../ports/product-repository.port";
import { Result } from "@/shared/result";

@Injectable()
export class DecreaseStockUseCase {
  constructor(
    @Inject("ProductRepositoryPort")
    private readonly productRepo: ProductRepositoryPort
  ) { }

  async execute(productId: string, quantity: number): Promise<Result<null>> {
    if (quantity <= 0) {
      return Result.fail("Invalid quantity");
    }

    try {
      await this.productRepo.decreaseStock(productId, quantity);
      return Result.ok(null);
    } catch (e) {
      return Result.fail(e.message ?? "Error decreasing stock");
    }
  }
}
