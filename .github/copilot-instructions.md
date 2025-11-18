# Copilot Instructions for Expense Tracker

## Architecture Overview

This is a **Domain-Driven Design (DDD)** TypeScript/Node.js backend with a React frontend for personal finance management. The system tracks transactions, analyzes spending against category weight preferences, and sends intelligent notifications.

### Core Structure

```
backend/src/
├── domain/           # Business logic layer (services, models, repositories)
├── api/             # HTTP layer (controllers, routes, DTOs, validators)
├── infra/           # Infrastructure (database, email, queues, logging)
├── config/          # Configuration and defaults
└── types/           # Global type definitions
```

## Domain Layer Patterns

### Factory Pattern for Domain Models
Always create domain models through factories, never directly:

```typescript
// ✅ Correct
const transaction = TransactionFactory.createTransaction(data, userId);
const notification = NotificationFactory.createNotification(data);

// ❌ Wrong
const transaction = new TransactionModel(data);
```

### Repository Pattern
Repositories extend `Database` class and include logging + error handling:

```typescript
export class TransactionRepository extends Database {
  async save(transaction: TransactionModel): Promise<TransactionModel> {
    // Implementation with logging and error handling
  }
}
```

### Service Layer
Services orchestrate business logic, use dependency injection, and follow this pattern:

```typescript
export class ExampleService {
  #repository: ExampleRepository;  // Private fields with #
  
  constructor(repository: ExampleRepository) {
    this.#repository = repository;
  }
}

// Always export singleton instance
export const exampleService = new ExampleService(exampleRepository);
```

## API Layer Conventions

### Authentication Flow
- Clerk middleware sets `req.user.id` on authenticated requests
- Controllers access `req.user?.id` for user context
- All protected routes use `apiAuth` middleware

### Request/Response DTOs
- Request DTOs in `api/controllers/dtos/request/`
- Response DTOs in `api/controllers/dtos/response/`
- Always map domain models to DTOs in controllers

### Validation Pattern
Routes use express-validator with dedicated validator files:

```typescript
// In routes
route.post('/', createNotificationRequestValidator, validateRequest, asyncHandler(controller.create));

// In validators
export const createNotificationRequestValidator = [
  body('title').trim().notEmpty().isLength({ min: 1, max: 255 }),
  // ...
];
```

## Key Business Features

### Notification System
- **Generic resource linking**: Uses `resourceType` + `resourceId` for flexibility
- **Dedupe prevention**: Uses composite `dedupeKey` to prevent duplicate notifications
- **Auto-triggering**: Spending analysis auto-triggers threshold notifications after expense transactions

### Spending Analysis Engine
- Compares actual spending vs user's category weight preferences
- Triggers notifications when spending exceeds target + 5% buffer
- Background processing via `#evaluateThresholdsAsync()` to avoid blocking responses

### Category Weights
- Default weights in `config/default-category-weights.ts`
- User overrides stored in database, merged with defaults
- Effective weights calculated per user for threshold analysis

## Database & Infrastructure

### Prisma Integration
- Generated client in `generated/prisma/`
- Database class extends PrismaClient: `export class Database extends PrismaClient`
- Raw SQL queries for complex analytics in `analytics.repository.ts`

### Currency Handling
- All transactions store both original amount and `amountUsd`
- Analytics and comparisons always use USD amounts
- `CurrencyConversionService` handles real-time conversion

## Development Workflows

### Essential Commands
```bash
npm run dev          # Development with nodemon
npm run build        # TypeScript compilation + alias resolution
npm run db:migrate   # Create new Prisma migration
npm run db:gen       # Generate Prisma client
npm run db:deploy    # Deploy migrations
```

### Testing New Features
1. Create domain models with factories
2. Implement repository with logging/error handling
3. Build service with business logic + singleton export
4. Create DTOs and validators
5. Add controller with proper authentication checks
6. Register routes with middleware chain

## Critical Integration Points

### Transaction → Notification Flow
```typescript
// In TransactionService.create()
const createdTransaction = await this.#repository.save(transaction);

// Trigger background threshold evaluation
if (data.type === 'EXPENSE' && data.userId) {
  this.#evaluateThresholdsAsync(data.userId);
}
```

### Swagger Documentation
- All routes documented with `@swagger` comments
- Available at `/api-docs` in development
- Includes request/response schemas and examples

## Import Alias Patterns
Use TypeScript path aliases consistently:
- `@domain/` → `src/domain/`
- `@api/` → `src/api/`
- `@infra/` → `src/infra/`
- `@config/` → `src/config/`

## Error Handling
- Domain exceptions in `domain/exceptions/`
- Global error handler in `api/routes/utils/request-error-handler`
- Structured logging with winston: `log.info()`, `log.error()`
