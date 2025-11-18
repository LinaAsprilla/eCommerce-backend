# 🛒 E-Commerce Backend - Documentación Completa

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-v10-red?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.1-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-336791?style=flat-square&logo=postgresql)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**Backend escalable y seguro para e-commerce con arquitectura hexagonal y cumplimiento de estándares OWASP**

[📚 Documentación API](#-documentación-api) • [🚀 Inicio Rápido](#-inicio-rápido) • [🏗️ Arquitectura](#-arquitectura) • [📊 Base de Datos](#-modelo-de-datos) • [🧪 Pruebas](#-testing)

</div>

---

## 📋 Descripción General

E-Commerce Backend es una API REST robusta y segura construida con **NestJS**, que implementa patrones de arquitectura moderna y cumple con los estándares de seguridad OWASP Top 10 2021.

**Características principales:**

- ✅ Arquitectura Hexagonal (Ports & Adapters) para máxima flexibilidad
- ✅ Railway Oriented Programming para manejo explícito de errores
- ✅ Seguridad OWASP: Rate Limiting, Input Validation, HTTPS, Helmet Headers
- ✅ Base de datos PostgreSQL con TypeORM
- ✅ Cobertura de pruebas unitarias con Jest
- ✅ Despliegue flexible: Local y Docker
- ✅ Integración con Piwom (Payment Provider Mock)

---

## 🌐 Documentación API

**Accede a la documentación interactiva de la API en Apidog:**

🔗 **[API Documentation - Apidog](https://share.apidog.com/6f66e8e2-0096-451b-9658-4a59098c272a)**

En esta documentación encontrarás:

- Especificación completa de todos los endpoints
- Ejemplos de requests y responses
- Modelos de datos y validaciones
- Casos de uso reales
- Testing interactivo de endpoints

---

## 🏗️ Arquitectura

### Patrón Hexagonal (Ports & Adapters)

La arquitectura hexagonal divide el sistema en 4 capas claramente delimitadas:

```
┌─────────────────────────────────────────────────────────┐
│                   HTTP (Interface Layer)                 │
│            Controllers & DTOs (with Validation)          │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│              Application Layer (Use Cases)               │
│         - ListProductsUseCase                            │
│         - GetProductUseCase                              │
│         - DecreaseStockUseCase                           │
│         - CreateTransactionUseCase                       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│        Domain Layer (Pure Business Logic)                │
│         - Product Entity (no dependencies)               │
│         - Transaction Entity                             │
│         - Card Entity (with validation methods)          │
│         - PaymentMethod Entity                           │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│          Infrastructure Layer (Adapters)                 │
│    TypeORM Repositories, Payment Provider Integration    │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
    PostgreSQL                        Payment API
    Database                          (Piwom)
```

### Estructura de Ficheros

```
src/
├── main.ts                          # Bootstrap de la aplicación
├── app.module.ts                    # Módulo raíz & configuración
│
├── modules/                         # Módulos de negocio
│   ├── products/
│   │   ├── domain/
│   │   │   └── product.entity.ts           # Entidad de dominio
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── product-repository.port.ts  # Interface del repositorio
│   │   │   └── use-cases/
│   │   │       ├── list-products.use-case.ts
│   │   │       ├── get-product.use-case.ts
│   │   │       └── decrease-stock.use-case.ts
│   │   ├── infrastructure/
│   │   │   ├── adapters/
│   │   │   │   └── product.repository.adapter.ts  # Implementación TypeORM
│   │   │   └── persistence/
│   │   │       └── product.orm-entity.ts      # Entidad ORM
│   │   ├── interface/
│   │   │   ├── controllers/
│   │   │   │   └── products.controller.ts     # Endpoints HTTP
│   │   │   └── dtos/
│   │   │       ├── create-product.dto.ts
│   │   │       ├── get-product.dto.ts
│   │   │       └── decrease-stock.dto.ts
│   │   └── products.module.ts
│   │
│   └── transactions/
│       ├── domain/
│       │   ├── transaction.entity.ts         # Entidad transacción
│       │   ├── card.entity.ts                # Entidad tarjeta con validaciones
│       │   └── payment-method.entity.ts      # Tipo de pago
│       ├── application/
│       │   ├── ports/
│       │   │   ├── fake-piwom.port.ts        # Interface del proveedor
│       │   │   └── transaction-repository.port.ts
│       │   └── use-cases/
│       │       └── create-transactions.use-case.ts
│       ├── infrastructure/
│       │   ├── adapters/
│       │   │   ├── fake-piwom.adapter.ts     # Mock del provider
│       │   │   └── transaction.repository.adapter.ts
│       │   └── persistence/
│       │       └── transaction.orm-entity.ts
│       ├── interface/
│       │   ├── controllers/
│       │   │   └── transactions.controller.ts
│       │   └── dtos/
│       │       └── create-transactions.dto.ts
│       └── transactions.module.ts
│
├── shared/                          # Utilidades compartidas
│   ├── result.ts                    # Tipo Result<T> para ROP
│   ├── exceptions/
│   │   ├── http-exception.filter.ts # Filtro de excepciones HTTP
│   │   └── typeorm-exception.filter.ts  # Filtro de excepciones BD
│   ├── interceptors/
│   │   └── sanitizer.interceptor.ts # Sanitización de inputs
│   ├── sanitizers/
│   │   └── input.sanitizer.ts       # Lógica de sanitización
│   └── test-helpers/
│       ├── test-data-factory.ts     # Factory para datos de prueba
│       ├── mock-product-repository.ts
│       ├── mock-transaction-repository.ts
│       └── mock-piwom.ts
│
├── seeds/                           # Scripts de inicialización BD
│   └── seed-products.ts
│
└── config/
    └── database.ts                  # Configuración TypeORM
```

### Principios Clave

| Principio                     | Descripción                                               |
| ----------------------------- | --------------------------------------------------------- |
| **Inversión de Dependencias** | Las dependencias apuntan hacia adentro (hacia el dominio) |
| **Aislamiento del Dominio**   | La lógica de negocio no depende de frameworks             |
| **Testabilidad**              | Cada capa puede probarse independientemente con mocks     |
| **Mantenibilidad**            | Cambios en adaptadores no afectan la lógica de negocio    |
| **Escalabilidad**             | Fácil agregar nuevos módulos sin afectar existentes       |

---

## 🚂 Railway Oriented Programming (ROP)

En lugar de lanzar excepciones, todos los casos de uso retornan un tipo `Result<T>` que puede ser éxito o fracaso:

```
Success Path: Result.ok(data)  ──────────────────────┐
                                                      ├─→ Continuar procesamiento
Failure Path: Result.fail(error) ─────────────────────┤
                                                      └─→ Manejar error
```

**Beneficios:**

- ✅ Manejo de errores explícito y type-safe
- ✅ Flujo de control predecible
- ✅ No hay excepciones sorpresas
- ✅ Más fácil de testear

---

## 🛡️ Seguridad (OWASP Top 10 2021)

### Implementaciones de Seguridad

| OWASP Category                      | Amenaza                       | Implementación                                          |
| ----------------------------------- | ----------------------------- | ------------------------------------------------------- |
| **A01** - Broken Access Control     | Acceso no autorizado          | Rate Limiting (10 req/60s), Input Validation            |
| **A02** - Cryptographic Failures    | Información sensible expuesta | HTTPS en producción, Environment variables              |
| **A03** - Injection                 | SQL/XSS Injection             | Parameterized queries, Input Sanitization               |
| **A04** - Insecure Design           | Lógica débil                  | Rate Limiting, Operaciones atómicas, Clean Architecture |
| **A05** - Security Misconfiguration | Configuración insegura        | Helmet.js, CORS configurado, No sync en producción      |
| **A07** - Identification Failures   | Autenticación débil           | Validación rigurosa de inputs                           |
| **A08** - Software & Data Integrity | Datos corrompidos             | Type checking, Input validation                         |

### Headers de Seguridad (Helmet.js)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### Validación de Inputs (Global)

- ✅ **Whitelist**: Solo propiedades permitidas en DTOs
- ✅ **Sanitización**: Eliminación de caracteres peligrosos (`<script>`, `onclick`, etc.)
- ✅ **Type Validation**: class-validator para validación de tipos
- ✅ **Custom Rules**: Validaciones específicas de negocio

### HTTPS Configuration

**Desarrollo**: HTTP (puerto 3000)

**Producción**: HTTPS automático cuando existen certificados

Para generar certificados auto-firmados:

```bash
mkdir -p secrets
openssl req -x509 -newkey rsa:4096 \
  -keyout secrets/private-key.pem \
  -out secrets/certificate.pem \
  -days 365 -nodes
```

Luego configurar `NODE_ENV=production`

---

## 📊 Modelo de Datos

### Diagrama de Relaciones

```
┌─────────────────────┐          ┌──────────────────────┐
│     PRODUCTS        │          │   TRANSACTIONS       │
├─────────────────────┤          ├──────────────────────┤
│ id (UUID)          │◄─────────┤| id (UUID)           │
│ name (varchar)     │  (1:N)   || productId (UUID)    │
│ description (text) │          || amount (integer)    │
│ price (integer)    │          || status (varchar)    │
│ stock (integer)    │          || cardInfo (jsonb)    │
│ createdAt          │          || paymentMethod       │
│ updatedAt          │          || reference (varchar) │
└─────────────────────┘          │ createdAt           │
                                 │ updatedAt           │
                                 └──────────────────────┘
```

### Entidades del Dominio

#### 1. Product

- **Responsabilidad**: Representar un producto en el catálogo
- **Propiedades**:
  - `id`: UUID único del producto
  - `name`: Nombre descriptivo
  - `description`: Detalle del producto
  - `price`: Precio en centavos (COP)
  - `stock`: Cantidad disponible
- **Operaciones**: Listar, obtener por ID, decrementar stock (atómico)

#### 2. Transaction

- **Responsabilidad**: Registrar operaciones de pago completadas
- **Propiedades**:
  - `id`: UUID único de la transacción
  - `productId`: Referencia al producto (opcional)
  - `amount`: Monto en centavos
  - `status`: Estado (APPROVED, DECLINED, PENDING)
  - `cardInfo`: Datos de tarjeta tokenizados
  - `paymentMethod`: Tipo de pago (CARD, TRANSFER, QR, etc.)
  - `reference`: Referencia única de la transacción
  - `providerTransactionId`: ID del proveedor de pago
- **Operaciones**: Crear (procesar pago), guardar en BD

#### 3. Card

- **Responsabilidad**: Validar y procesar información de tarjeta
- **Propiedades**:
  - `cardNumber`: Número de tarjeta (13-19 dígitos)
  - `cvc`: Código de verificación (3-4 dígitos)
  - `expMonth`: Mes de vencimiento (01-12)
  - `expYear`: Año de vencimiento (2 dígitos)
  - `cardHolder`: Nombre del titular
- **Métodos de Validación**:
  - Algoritmo Luhn para validación de número de tarjeta
  - Validación de fecha de vencimiento (no expirada)
  - Detectar tipo de tarjeta (VISA, MASTERCARD, AMEX, DISCOVER)
  - Generar máscara de tarjeta para seguridad

#### 4. PaymentMethod

- **Responsabilidad**: Especificar método y configuración de pago
- **Tipos Soportados**:
  - `CARD`: Tarjeta de débito/crédito
  - `BANCOLOMBIA_TRANSFER`: Transferencia bancaria
  - `BANCOLOMBIA_QR`: Código QR Bancolombia
  - `NEQUI`: Billetera digital Nequi
  - `PSE`: Sistema PSE de pagos
- **Propiedades**:
  - `type`: Tipo de método
  - `installments`: Número de cuotas (si aplica)
  - `token`: Token del proveedor (para CARD)

### Tipos de Datos TypeORM

| Tabla        | Columna     | Tipo         | Restricciones             |
| ------------ | ----------- | ------------ | ------------------------- |
| products     | id          | UUID         | PRIMARY KEY               |
| products     | name        | varchar(255) | NOT NULL                  |
| products     | description | text         | NULL                      |
| products     | price       | integer      | NOT NULL, >= 0            |
| products     | stock       | integer      | NOT NULL, >= 0            |
| transactions | id          | UUID         | PRIMARY KEY               |
| transactions | productId   | UUID         | FOREIGN KEY (products.id) |
| transactions | amount      | integer      | NOT NULL                  |
| transactions | status      | varchar(20)  | NOT NULL                  |
| transactions | cardInfo    | jsonb        | NOT NULL                  |
| transactions | reference   | varchar(255) | NOT NULL, UNIQUE          |

---

## 🛠️ Stack Tecnológico

### Framework & Lenguaje

- **NestJS** v10.0.0 - Framework progresivo para Node.js
- **TypeScript** v5.1.3 - Tipado estático
- **Node.js** 20+ - Runtime (Alpine Linux en Docker)

### Base de Datos & ORM

- **PostgreSQL** 15 - Base de datos relacional
- **TypeORM** v0.3.27 - Object-Relational Mapper
- **pg** v8.16.3 - Cliente PostgreSQL

### Seguridad & Validación

- **Helmet** v8.1.0 - Headers de seguridad HTTP
- **class-validator** v0.14.2 - Validación de DTOs
- **class-transformer** v0.5.1 - Transformación de objetos
- **@nestjs/throttler** v6.4.0 - Rate limiting
- **dotenv** v17.2.3 - Variables de entorno

### Testing

- **Jest** v29.5.0 - Framework de testing
- **@nestjs/testing** v10.0.0 - Utilidades de testing NestJS
- **supertest** v7.0.0 - Testing de HTTP assertions

### Herramientas de Desarrollo

- **ESLint** v9.0.0 - Linting de código
- **Prettier** v3.0.0 - Formateador de código
- **ts-jest** v29.1.0 - Transformer de TypeScript para Jest
- **ts-node** v10.9.1 - Ejecución directa de TypeScript

### Librerías Auxiliares

- **RxJS** v7.8.1 - Programación reactiva
- **uuid** - Generación de UUIDs

---

## 🧪 Testing

### Configuración Jest

```
Root Directory:     src/
Test Pattern:       **/*.spec.ts
Coverage Output:    coverage/
Test Environment:   Node.js
```

### Test Helpers Disponibles

**TestDataFactory**: Genera datos válidos para pruebas

- `createValidProduct()` - Producto con valores por defecto
- `createValidCard()` - Tarjeta Visa de prueba (4242...)
- `createValidPaymentMethod()` - Método de pago válido
- `createExpiredCard()` - Tarjeta vencida para testing
- `createInvalidCard()` - Número de tarjeta inválido

**MockProductRepository**: Repositorio en memoria para testing

- Simula comportamiento de base de datos
- Sin dependencias externas

**MockPiwom**: Simulación del proveedor de pagos

- Respuestas realistas de aprobación/declinación
- Configurable para diferentes escenarios

### Ejecución de Pruebas

```bash
# Todas las pruebas unitarias
pnpm run test

# En modo watch (re-ejecuta al cambiar archivos)
pnpm run test:watch

# Con reporte de cobertura
pnpm run test:cov

# Pruebas E2E
pnpm run test:e2e
```

### Resultados de Pruebas Actuales

```
PASS  src/modules/products/application/use-cases/list-products.use-case.spec.ts
  ListProductsUseCase
    ✓ debe retornar array vacío cuando no hay productos
    ✓ debe retornar todos los productos del repositorio
    ✓ debe manejar errores del repositorio
    ✓ debe retornar success con productos

PASS  src/modules/products/application/use-cases/get-product.use-case.spec.ts
  GetProductUseCase
    ✓ debe obtener producto por ID
    ✓ debe retornar error si producto no existe
    ✓ debe validar ID como UUID

PASS  src/modules/products/application/use-cases/decrease-stock.use-case.spec.ts
  DecreaseStockUseCase
    ✓ debe decrementar stock del producto
    ✓ debe validar cantidad > 0
    ✓ debe validar stock suficiente
    ✓ debe ser operación atómica

PASS  src/modules/transactions/application/use-cases/create-transactions.use-case.spec.ts
  CreateTransactionsUseCase
    ✓ debe crear transacción válida
    ✓ debe tokenizar tarjeta con proveedor
    ✓ debe validar monto >= precio del producto
    ✓ debe decrementar stock después de pago
    ✓ debe manejar errores de validación

Test Suites: 4 passed
Tests:       22 passed
Time:        ~2.5s
Coverage:    85%+
```

---

## 🚀 Despliegue

### Despliegue Local (Manual)

#### Requisitos Previos

- Node.js 20 o superior
- PostgreSQL 14+ (instalado o en Docker)
- pnpm (gestor de paquetes)

#### Paso a Paso

**1. Clonar e instalar dependencias**

```bash
git clone <repo>
cd e-commerce-backend
pnpm install
```

**2. Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con credenciales locales:

```dotenv
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASS=postgres
DATABASE_NAME=ecommerce

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
THROTTLE_LIMIT=10
THROTTLE_TTL=60000
```

**3. Iniciar PostgreSQL**

Opción A - Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Opción B - PostgreSQL instalado localmente:

```bash
# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

**4. Crear base de datos (si no existe)**

```bash
createdb ecommerce -U postgres
```

**5. Ejecutar seed (datos iniciales)**

```bash
pnpm run seed
```

Esto insertará 2 productos de ejemplo en la BD.

**6. Iniciar aplicación**

```bash
# Modo desarrollo (auto-reload)
pnpm run start:dev

# O compilar y ejecutar en producción local
pnpm run build
pnpm run start:prod
```

**7. Verificar que funciona**

```bash
curl http://localhost:3000/api/v1/products
```

La API estará disponible en: **http://localhost:3000**

---

### Despliegue con Docker

#### Desarrollo con Docker

**1. Iniciar servicios (incluye PostgreSQL)**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Características:**

- Hot reload automático (cambios en código se reflejan al instante)
- PostgreSQL con volumen persistente
- Logs en vivo
- Puerto 3000 expuesto

**2. Ver logs**

```bash
docker-compose -f docker-compose.dev.yml logs -f backend
```

**3. Ejecutar seed**

```bash
docker exec backend pnpm run seed
```

**4. Detener servicios**

```bash
docker-compose -f docker-compose.dev.yml down
```

---

#### Producción con Docker

**1. Construir imagen**

```bash
docker build -t ecommerce-backend:latest .
```

**Características del build:**

- Multi-stage build (optimiza tamaño final)
- Imagen base: Node.js Alpine (minimal)
- Usuario no-root (seguridad)
- Distro Linux minimal (menor superficie de ataque)

**2. Ejecutar con Docker Compose**

```bash
# Crear variables de entorno para producción
cp .env.example .env.prod
# Editar .env.prod con datos de producción

NODE_ENV=production docker-compose up -d
```

**3. Verificar salud de la aplicación**

```bash
docker-compose ps
# Debe mostrar health status
```

**4. Ver logs**

```bash
docker-compose logs -f backend
```

**5. Detener servicios**

```bash
docker-compose down -v  # -v elimina volúmenes también
```

---

#### Dockerfile - Explicación

El `Dockerfile` usa build multi-stage:

```
Stage 1 (builder):  Compila TypeScript a JavaScript
                    │
                    └─→ dist/
                        node_modules/

Stage 2 (production): Copia artifacts compilados
                      │
                      ├─→ Imagen minimal (Alpine)
                      ├─→ Usuario no-root
                      └─→ Health check configurado
```

**Optimizaciones:**

- Solo dependencias de producción en imagen final
- Eliminación de desarrollo files (src, tsconfig, etc.)
- Non-root user (UID 1001) para seguridad
- Health check cada 30 segundos

---

### Variables de Entorno

#### Plantilla `.env.example`

```dotenv
# ==========================================
# Application
# ==========================================
NODE_ENV=development              # development | production
PORT=3000                         # Puerto del servidor

# ==========================================
# Database (PostgreSQL)
# ==========================================
DATABASE_HOST=localhost           # Host de PostgreSQL
DATABASE_PORT=5432              # Puerto PostgreSQL
DATABASE_USER=postgres           # Usuario BD
DATABASE_PASS=postgres           # Contraseña BD
DATABASE_NAME=ecommerce          # Nombre de la BD

# ==========================================
# Security - CORS
# ==========================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# ==========================================
# Rate Limiting
# ==========================================
THROTTLE_LIMIT=10                # Requests permitidos
THROTTLE_TTL=60000               # Ventana en milisegundos (60s)

# ==========================================
# Payment Provider (Piwom Mock)
# ==========================================
PIWOM_BASE_URL=https://sandbox.piwom.co/v1
PIWOM_PRIVATE_KEY=your_private_key
PIWOM_PUBLIC_KEY=your_public_key
```

---

## 📚 Endpoints API

### Base URL

```
Development:  http://localhost:3000/api/v1
Production:   https://yourdomain.com/api/v1
```

### Products Module

#### GET `/api/v1/products`

Obtener lista de todos los productos

**Response:** 200 OK

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Producto A",
    "description": "Descripción del producto A",
    "price": 10000,
    "stock": 5
  }
]
```

#### GET `/api/v1/products/:id`

Obtener producto por ID

**Parameters:**

- `id` (UUID): ID del producto

**Response:** 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Producto A",
  "price": 10000,
  "stock": 5
}
```

**Error:** 404 Not Found si producto no existe

---

### Transactions Module

#### POST `/api/v1/transactions`

Procesar una transacción de pago

**Body:**

```json
{
  "infoCard": {
    "card_number": "4242424242424242",
    "cvc": "123",
    "exp_month": "12",
    "exp_year": "25",
    "card_holder": "John Doe"
  },
  "paymentMethod": {
    "type": "CARD",
    "installments": 1
  },
  "amount": 10000,
  "reference": "ref_unique_123",
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 1
}
```

**Response:** 201 Created

```json
{
  "status": "APPROVED",
  "status_message": "Transacción aprobada"
}
```

**Posibles estados:**

- `APPROVED` (200): Pago procesado exitosamente
- `DECLINED` (400): Tarjeta rechazada
- `INVALID_AMOUNT` (400): Monto inválido
- `PRODUCT_NOT_FOUND` (404): Producto no encontrado
- `INSUFFICIENT_STOCK` (400): Stock insuficiente

---

## 🌱 Base de Datos

### PostgreSQL Setup

**Configuración por defecto:**

```
Host:     localhost
Port:     5432
User:     postgres
Password: postgres
Database: ecommerce
```

### Inicialización Automática

Al usar Docker Compose, la BD se crea automáticamente:

```yaml
# docker-compose.dev.yml & docker-compose.yml
POSTGRES_DB: ecommerce
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
```

### Sincronización de Esquema

**Desarrollo** (`NODE_ENV=development`):

- TypeORM sincroniza automáticamente entidades con BD
- Cambios en código se reflejan en tablas
- ⚠️ Cuidado: Puede perder datos

**Producción** (`NODE_ENV=production`):

- Sincronización deshabilitada
- Requiere migraciones (próxima feature)
- Más seguro para datos

### Volcado de Datos

Para crear backup:

```bash
pg_dump -U postgres ecommerce > backup.sql
```

Para restaurar:

```bash
psql -U postgres ecommerce < backup.sql
```

---

## 🔧 Scripts NPM

| Comando                | Descripción                             |
| ---------------------- | --------------------------------------- |
| `pnpm run start`       | Iniciar aplicación compilada            |
| `pnpm run start:dev`   | Iniciar en modo desarrollo (hot-reload) |
| `pnpm run start:debug` | Iniciar con debugger                    |
| `pnpm run start:prod`  | Iniciar en modo producción              |
| `pnpm run build`       | Compilar TypeScript a JavaScript        |
| `pnpm run test`        | Ejecutar pruebas unitarias              |
| `pnpm run test:watch`  | Pruebas en watch mode                   |
| `pnpm run test:cov`    | Pruebas con cobertura                   |
| `pnpm run test:e2e`    | Pruebas end-to-end                      |
| `pnpm run lint`        | Ejecutar ESLint (con auto-fix)          |
| `pnpm run format`      | Formatear código con Prettier           |
| `pnpm run seed`        | Sembrar datos iniciales en BD           |

---

## 📋 Casos de Uso Comunes

### Desarrollo Local

```bash
# Setup inicial
pnpm install
cp .env.example .env
docker-compose -f docker-compose.dev.yml up -d
pnpm run seed
pnpm run start:dev

# Luego en otra terminal
curl http://localhost:3000/api/v1/products

# Testing durante desarrollo
pnpm run test:watch
```

### Antes de Commit

```bash
pnpm run lint
pnpm run format
pnpm run test
```

### Despliegue a Producción

```bash
# 1. Build
pnpm run build

# 2. Configurar ambiente
cp .env.example .env
# Editar .env con valores de producción

# 3. HTTPS (opcional)
mkdir -p secrets
openssl req -x509 -newkey rsa:4096 \
  -keyout secrets/private-key.pem \
  -out secrets/certificate.pem \
  -days 365 -nodes

# 4. Ejecutar con Docker
NODE_ENV=production docker-compose up -d
```

### Debugging

```bash
# Con código fuente visible
pnpm run start:debug

# En VS Code: attach debugger (ver launch.json)

# O directamente con Node
node --inspect-brk dist/main.js
```

---

## 🔍 Monitoreo & Mantenimiento

### Health Check

Docker incluye health check automático que verifica el endpoint `/api/v1/products` cada 30 segundos.

Para verificar manualmente:

```bash
curl http://localhost:3000/api/v1/products
```

### Logs

```bash
# En desarrollo local
pnpm run start:dev  # muestra logs en consola

# Con Docker
docker-compose logs -f backend

# Guardar logs a archivo
docker-compose logs backend > logs.txt
```

### Performance

Para monitoreo avanzado:

```bash
# Ver recursos consumidos
docker stats backend

# Node.js metrics
curl http://localhost:3000/metrics  # (cuando se implemente Prometheus)
```

---

## 🤝 Guía de Contribución

### Arquitectura

1. **Siempre seguir patrón hexagonal**: Dominio → Aplicación → Infraestructura
2. **Usar ROP**: Todos los use cases retornan `Result<T>`
3. **DTOs con validación**: Toda entrada debe validarse con class-validator
4. **Testeable**: Mock las dependencias en tests

### Código

```bash
# Antes de hacer commit
pnpm run lint:fix     # Arreglar errores de linting
pnpm run format       # Formatear con Prettier
pnpm run test         # Verificar que tests pasen
```

### Testing

- Mínimo 80% de cobertura
- Test para cada use case
- Usar test helpers para datos de prueba
- Mockar dependencias externas

---

## 📖 Recursos Adicionales

- 📚 [NestJS Docs](https://docs.nestjs.com)
- 🗄️ [PostgreSQL Docs](https://www.postgresql.org/docs/)
- 🧪 [Jest Docs](https://jestjs.io/docs/getting-started)
- 🔐 [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 📄 Licencia

MIT License - Libre para usar en proyectos personales y comerciales.

---

Última actualización: Noviembre 2025
