import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './shared/exceptions/typeorm-exception.filter';
import { HttpExceptionFilter } from './shared/exceptions/http-exception.filter';
import { SanitizerInterceptor } from './shared/interceptors/sanitizer.interceptor';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as fs from 'node:fs';

async function bootstrap() {

  const httpsOptions = process.env.NODE_ENV === 'production' &&
    fs.existsSync('./secrets/private-key.pem') &&
    fs.existsSync('./secrets/certificate.pem')
    ? {
      key: fs.readFileSync('./secrets/private-key.pem'),
      cert: fs.readFileSync('./secrets/certificate.pem'),
    }
    : undefined;

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // Security Headers with Helmet (OWASP A05:2021)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
    }),
  );

  // CORS Configuration (OWASP A07:2021)
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600,
  });

  // Global Input Sanitization (OWASP A03:2021 - Injection)
  app.useGlobalInterceptors(new SanitizerInterceptor());

  // Global Validation Pipe (OWASP A03:2021 - Injection)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new TypeOrmExceptionFilter(),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application running on: ${httpsOptions ? 'https' : 'http'}://localhost:${port}`);
}
bootstrap();
