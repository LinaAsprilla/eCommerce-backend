import { DataSource } from 'typeorm';
import { ProductOrm } from '../modules/products/infrastructure/persistence/product.orm-entity';
import * as dotenv from 'dotenv';
dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  entities: [ProductOrm],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(ProductOrm);

  const products = [
    { id: 'p-1', name: 'Producto A', description: 'Desc A', price: 10000, stock: 5 },
    { id: 'p-2', name: 'Producto B', description: 'Desc B', price: 20000, stock: 3 },
  ];

  for (const p of products) {
    const exists = await repo.findOne({ where: { id: p.id } });
    if (!exists) await repo.save(p);
  }

  console.log('Seed done');
  await dataSource.destroy();
}

seed().catch(e => { console.error(e); process.exit(1); });
