import { ProductOrm } from "@/modules/products/infrastructure/persistence/product.orm-entity";
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("transactions")
export class TransactionOrm {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  status: string;

  @Column("int")
  amount: number;

  @ManyToOne(() => ProductOrm)
  @JoinColumn({ name: "productId" })
  product: ProductOrm;

  @Column({ nullable: true })
  providerTransactionId?: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
