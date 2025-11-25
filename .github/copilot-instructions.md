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

### MANDATORY: Complete Domain Layer Setup for New Entities

When creating a new database entity, you MUST create ALL of the following components in this exact order:

#### 1. Domain Model (`domain/models/*.model.ts`)

The domain model encapsulates business logic and invariants. It must:

- Use private fields with `#` prefix
- Expose getters for all fields
- Include business logic methods (validation, state transitions, calculations)
- Enforce domain rules and invariants
- Never allow invalid state transitions

```typescript
export class AnalysisRunModel {
  readonly #id: string;
  #status: AnalysisRunStatus;
  #attemptCount: number;

  constructor(data: AnalysisRunDataInput) {
    // Initialize with defaults
    this.#id = data.id ?? uuidv4();
    this.#status = data.status ?? AnalysisRunStatus.PENDING;
  }

  // Getters
  get id(): string {
    return this.#id;
  }
  get status(): AnalysisRunStatus {
    return this.#status;
  }

  // Business logic with state guards
  markAsCompleted(): void {
    if (this.#status !== AnalysisRunStatus.PROCESSING) {
      throw new Error("Can only mark PROCESSING runs as completed");
    }
    this.#status = AnalysisRunStatus.COMPLETED;
    this.#updatedAt = new Date();
  }
}
```

**Key Rules:**

- ✅ All business logic lives in the model
- ✅ State transitions must have validation guards
- ✅ Use private fields with getters (immutability where appropriate)
- ❌ Never expose setters that allow invalid states
- ❌ No business logic in repositories or services

#### 2. Mapper (`domain/repositories/helpers/map-*.ts`)

Maps Prisma entities to domain models:

```typescript
/* eslint-disable no-unused-vars */
export function mapAnalysisRun(entity: AnalysisRunEntity): AnalysisRunModel;
export function mapAnalysisRun(entity: null): null;
export function mapAnalysisRun(
  entity: AnalysisRunEntity | null
): AnalysisRunModel | null;
/* eslint-enable no-unused-vars */
export function mapAnalysisRun(
  entity: AnalysisRunEntity | null
): AnalysisRunModel | null {
  if (!entity) return null;

  return new AnalysisRunModel({
    id: entity.id,
    status: entity.status,
    attemptCount: entity.attemptCount,
    lastError: convertNullToUndefined(entity.lastError),
    // ... all fields
  });
}
```

**Key Rules:**

- ✅ Use function overloads for type safety
- ✅ Handle null values with `convertNullToUndefined()`
- ✅ Map ALL entity fields to model
- ❌ No business logic in mappers
- ❌ Never return raw Prisma entities

#### 3. Repository (`domain/repositories/*.repository.ts`)

Handles ONLY data persistence, no business logic:

```typescript
export class AnalysisRunRepository extends Database {
  async save(data: AnalysisRunModel): Promise<AnalysisRunModel> {
    try {
      const savedEntity: AnalysisRunEntity = await this.analysisRun.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          userId: data.userId,
          status: data.status,
          // Use model getters
        },
        update: {
          status: data.status,
          updatedAt: new Date(),
        },
      });

      return mapAnalysisRun(savedEntity); // Always map to model
    } catch (error) {
      log.error({
        message: "An error occurred while saving analysis run:",
        error,
        code: "ANALYSIS_RUN_SAVE_ERROR",
      });
      throw error;
    }
  }

  async findByStatus(status: AnalysisRunStatus): Promise<AnalysisRunModel[]> {
    const entities = await this.analysisRun.findMany({ where: { status } });
    return entities.map(mapAnalysisRun); // Map all results
  }
}

export const analysisRunRepository = new AnalysisRunRepository();
```

**Key Rules:**

- ✅ Repositories extend `Database` class
- ✅ Always map entities to models using mapper
- ✅ Include error logging with structured context
- ✅ Export singleton instance
- ❌ NO business logic (no status transitions, validations, calculations)
- ❌ Never return raw Prisma entities
- ❌ Never update status/state directly - use model methods

#### 4. Factory (Optional, for complex creation)

```typescript
export class AnalysisRunFactory {
  static create(data: AnalysisRunDataInput): AnalysisRunModel {
    // Complex validation and default logic
    return new AnalysisRunModel(data);
  }
}
```

### Common Anti-Patterns to AVOID

❌ **Business Logic in Repository:**

```typescript
// WRONG - status update in repository
async markCompleted(id: string): Promise<AnalysisRun> {
  return await this.analysisRun.update({
    where: { id },
    data: { status: 'COMPLETED' }
  });
}
```

✅ **Correct - Use Model Methods:**

```typescript
// RIGHT - status update via model
const run = await repository.findById(id);
run.markAsCompleted(); // Model enforces transition rules
await repository.save(run);
```

❌ **Returning Raw Entities:**

```typescript
// WRONG
async findById(id: string): Promise<AnalysisRun> {
  return await this.analysisRun.findUnique({ where: { id } });
}
```

✅ **Correct - Return Models:**

```typescript
// RIGHT
async findById(id: string): Promise<AnalysisRunModel | null> {
  const entity = await this.analysisRun.findUnique({ where: { id } });
  return mapAnalysisRun(entity);
}
```

❌ **Direct Model Instantiation (when factory exists):**

```typescript
// WRONG - bypassing factory validation
const model = new AnalysisRunModel(data);
```

✅ **Correct - Use Factory (if complex) or Constructor (if simple):**

```typescript
// RIGHT (simple cases - no factory needed)
const model = new AnalysisRunModel(data);

// RIGHT (complex cases with validation - use factory)
const transaction = TransactionFactory.createTransaction(data, userId);
```

### Service Layer

Services orchestrate business logic, use dependency injection, and follow this pattern:

```typescript
export class ExampleService {
  #repository: ExampleRepository; // Private fields with #

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
route.post(
  "/",
  createNotificationRequestValidator,
  validateRequest,
  asyncHandler(controller.create)
);

// In validators
export const createNotificationRequestValidator = [
  body("title").trim().notEmpty().isLength({ min: 1, max: 255 }),
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
if (data.type === "EXPENSE" && data.userId) {
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
