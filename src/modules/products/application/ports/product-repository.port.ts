import { Product } from "../../domain/product.entity";

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decreaseStock(productId: string, quantity: number): Promise<void>;
}
