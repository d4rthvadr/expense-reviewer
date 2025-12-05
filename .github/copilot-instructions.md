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
- **Services must return DTOs (not Models).** Use private `#toDto()` methods in services to map Models → DTOs. Controllers receive DTOs directly from services and should not perform additional mapping

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

## Queue & Background Job Patterns (BullMQ)

### Queue Worker Pattern

All queue workers follow this structure:

```typescript
import { Queue, Worker, Job, JobsOptions } from "bullmq";
import { log } from "@infra/logger";
import { getRedisInstance } from "@infra/db/cache";

const connection = getRedisInstance();
const QUEUE_NAME = "example-queue";

export type ExampleJobData = {
  userId: string;
  // ... other fields
};

class ExampleQueueService extends Worker {
  #queue: Queue;
  #dependency: SomeService; // Inject dependencies

  defaultJobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  };

  constructor(queue: Queue, dependency: SomeService) {
    super(
      QUEUE_NAME,
      async (job: Job) => {
        await this.handleJob(job);
      },
      { connection }
    );

    this.#queue = queue;
    this.#dependency = dependency;

    this.on("completed", (job) => {
      log.info(
        `Job ${job.name}:${job.id} successfully processed by ${this.constructor.name}`
      );
    });

    this.on("failed", (job, err) => {
      log.error({
        message: `Job ${job?.name}:${job?.id} failed in ${this.constructor.name}`,
        error: err,
        code: "",
      });
    });
  }

  async handleJob(job: Job<ExampleJobData>) {
    try {
      log.info({
        message: `Processing job in ${this.constructor.name}`,
        meta: { jobId: job.id, data: job.data },
      });

      const { userId } = job.data;
      // Process job logic
    } catch (error) {
      log.error({
        message: `Error processing job ${job.id}`,
        error,
        code: "",
      });
      throw error; // Re-throw for BullMQ retry mechanism
    }
  }

  async addJob(data: ExampleJobData) {
    const jobName = `example-${data.userId}`;
    await this.#queue.add(jobName, data, this.defaultJobOptions);
  }
}

// Create queue and service instance
const exampleQueue = new Queue(QUEUE_NAME, { connection });
const exampleQueueService = new ExampleQueueService(exampleQueue, dependency);

export { exampleQueueService, QUEUE_NAME };
```

**Key Rules:**

- ✅ Extend `Worker` class from BullMQ
- ✅ Use dependency injection via constructor
- ✅ Always include `completed` and `failed` event handlers
- ✅ Export singleton instance and QUEUE_NAME
- ✅ Use exponential backoff for retries (attempts: 3)
- ✅ Structure job data with TypeScript types
- ❌ Don't handle errors silently - always log and re-throw

### Cron Processor Pattern

For scheduled jobs, implement processors:

```typescript
import { CronServiceProcessor } from "./processor.interface";
import { Job } from "bullmq";
import { log } from "@infra/logger";

export class ExampleProcessor implements CronServiceProcessor {
  #service: ExampleService;

  constructor(service: ExampleService) {
    this.#service = service;
  }

  async process(job: Job) {
    try {
      log.info({
        message: `Processing ${this.constructor.name} job`,
        jobId: job.id,
      });

      // Implement batch processing logic
      // Use pagination for large datasets
    } catch (error) {
      log.error({
        message: `Error in ${this.constructor.name}`,
        error,
        code: "PROCESSOR_ERROR",
      });
      throw error;
    }
  }
}
```

**Register in `processor-names.ts` and `cron-service-queue.ts`**

## Express Validator Pattern

### Route Validation

```typescript
import { body, param, query } from "express-validator";
import { validateRequest } from "@api/middlewares/utils/validators";

// Define validators
export const createResourceValidator = [
  body("name").trim().notEmpty().isLength({ min: 2, max: 100 }),
  body("amount")
    .isNumeric()
    .custom((value) => value >= 0),
  body("category").isIn(CategoryValues),
];

export const updateResourceValidator = [
  param("id").isUUID(),
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
];

// Apply in routes
route.post(
  "/",
  createResourceValidator,
  validateRequest,
  asyncHandler(controller.create)
);
```

**Key Rules:**

- ✅ Create dedicated validator files per route group
- ✅ Use `validateRequest` middleware after validators
- ✅ Chain validators for complex validation
- ✅ Use `.custom()` for complex business rules
- ✅ Use `.optional()` for non-required fields
- ❌ Don't validate in controllers - do it in middleware

## Frontend Patterns (React/Next.js)

### Component Structure

Follow functional, declarative component design:

```typescript
"use client"; // Only for client components

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExampleProps {
  title: string;
  onAction: () => void;
}

export default function ExampleComponent({ title, onAction }: ExampleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}

ExampleComponent.displayName = "ExampleComponent";
```

**Key Rules:**

- ✅ Use functional components with hooks
- ✅ Define TypeScript interfaces for props
- ✅ Set `displayName` for better debugging
- ✅ Use `"use client"` directive only when needed (hooks, event handlers, browser APIs)
- ✅ Keep components focused and single-responsibility
- ❌ Avoid class components

### Form Handling with react-hook-form + Zod

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2).max(100),
  amount: z.number().min(0),
});

export default function ExampleForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // Call server action or API
      await someAction(data);
    } catch (error) {
      // Handle error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

**Key Rules:**

- ✅ Always use Zod for schema validation
- ✅ Use `zodResolver` with react-hook-form
- ✅ Define `defaultValues` for all fields
- ✅ Use shadcn/ui Form components for consistent styling
- ✅ Handle errors in `onSubmit` with try/catch
- ❌ Don't use uncontrolled forms

### State Management (Zustand)

```typescript
// Store definition (stores/example-store.ts)
import { createStore } from "zustand/vanilla";

export type ExampleState = {
  items: Item[];
  isLoading: boolean;
};

export type ExampleStore = ExampleState & {
  fetchItems: () => Promise<void>;
};

export const createExampleStore = (initialState: ExampleState) => {
  return createStore<ExampleStore>()((set) => ({
    ...initialState,
    fetchItems: async () => {
      set({ isLoading: true });
      // Fetch logic
      set({ items: data, isLoading: false });
    },
  }));
};

// Provider (providers/example-store-provider.tsx)
("use client");
import { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export const ExampleStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<ExampleStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createExampleStore(defaultState);
  }

  return (
    <ExampleStoreContext.Provider value={storeRef.current}>
      {children}
    </ExampleStoreContext.Provider>
  );
};

// Custom hook
export const useExampleStore = <T>(selector: (store: ExampleStore) => T): T => {
  const context = useContext(ExampleStoreContext);
  if (!context) throw new Error("useExampleStore must be used within provider");
  return useStore(context, selector);
};
```

**Key Rules:**

- ✅ Use vanilla Zustand with React context for SSR compatibility
- ✅ Create provider components for stores
- ✅ Export custom hooks for type-safe access
- ✅ Keep stores focused on single domains
- ✅ Use `useRef` to prevent store recreation on re-renders
- ❌ Don't use Zustand persist in SSR contexts
