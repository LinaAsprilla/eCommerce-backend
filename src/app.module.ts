import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ProductsModule } from "./modules/products/products.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    // Rate Limiting (OWASP A04:2021 - Insecure Design)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: Number.parseInt(process.env.DATABASE_PORT || "5432", 10),
      username: process.env.DATABASE_USER || "postgres",
      password: process.env.DATABASE_PASS || "postgres",
      database: process.env.DATABASE_NAME || "ecommerce",
      autoLoadEntities: true,
      // SECURITY: Disable synchronize in production (OWASP A05:2021)
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV === "development",
    }),
    ProductsModule,
    TransactionsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
