import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('products')
export class ProductOrm {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;

  @Column('int')
  stock: number;
}
