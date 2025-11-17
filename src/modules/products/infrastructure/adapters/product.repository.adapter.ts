import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { ProductOrm } from '../persistence/product.orm-entity';
import { Product } from '../../domain/product.entity';

@Injectable()
export class ProductRepositoryAdapter implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrm)
    private readonly repo: Repository<ProductOrm>
  ) { }

  async findAll(): Promise<Product[]> {
    const rows = await this.repo.find();
    return rows.map(r => new Product(r.id, r.name, r.description, r.price, r.stock));
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) return null;
    return new Product(row.id, row.name, row.description, row.price, row.stock);
  }

  async decreaseStock(productId: string, quantity: number): Promise<void> {
    const row = await this.repo.findOne({ where: { id: productId } });
    if (!row) {
      throw new Error('Product not found');
    }
    if (row.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Use atomic update to prevent race conditions (OWASP A04:2021)
    await this.repo.decrement({ id: productId }, 'stock', quantity);
  }
}
