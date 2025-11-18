import { ProductRepositoryPort } from '@/modules/products/application/ports/product-repository.port';
import { Product } from '@/modules/products/domain/product.entity';

export class MockProductRepository implements ProductRepositoryPort {
  private readonly products: Map<string, Product> = new Map();

  findAll(): Promise<Product[]> {
    return Promise.resolve(Array.from(this.products.values()));
  }

  findById(id: string): Promise<Product | null> {
    return Promise.resolve(this.products.get(id) || null);
  }

  decreaseStock(productId: string, quantity: number): Promise<void> {
    const product = this.products.get(productId);
    if (!product) {
      return Promise.reject(new Error('Product not found'));
    }

    if (product.stock < quantity) {
      return Promise.reject(new Error('Insufficient stock'));
    }

    const updatedProduct = new Product(
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock - quantity
    );

    this.products.set(productId, updatedProduct);
    return Promise.resolve();
  }

  // Helper methods for testing
  addProduct(product: Product): void {
    this.products.set(product.id, product);
  }

  clear(): void {
    this.products.clear();
  }

  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }
}
