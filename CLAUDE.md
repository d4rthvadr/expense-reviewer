# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal finance management system with a **Domain-Driven Design (DDD)** Node.js/Express backend and a Next.js 15 frontend. Tracks transactions, analyzes spending against category weight preferences, and sends AI-powered notifications.

## Development Commands

### Infrastructure (run from root)
```bash
docker-compose up -d       # Start PostgreSQL + Redis
```

### Backend (run from `backend/`)
```bash
npm run dev                # Start with nodemon (hot reload)
npm run build              # TypeScript compile + tsc-alias + copy templates
npm run test               # Run Jest tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
npm run lint:fix           # ESLint auto-fix
npm run format             # Prettier

# Database (Prisma)
npm run db:migrate         # Create + apply new migration
npm run db:deploy          # Apply existing migrations (CI/prod)
npm run db:gen             # Regenerate Prisma client after schema changes
npm run db:studio          # Open Prisma Studio UI
npm run db:seed-defaults   # Seed default category weights
```

### Frontend (run from `client/`)
```bash
npm run dev                # Next.js dev server (Turbopack)
npm run build              # Production build
npm run lint               # Next.js linting
```

## Architecture

```
/backend/src/
├── domain/       # Business logic (models, services, repositories, factories)
├── api/          # HTTP layer (controllers, routes, DTOs, validators)
├── infra/        # Database, Redis, queues (BullMQ), email, logger (Winston)
├── config/       # App config, default category weights
└── types/        # Global TypeScript types

/client/src/
├── app/          # Next.js App Router pages
├── components/   # React components (Radix UI + shadcn/ui)
├── stores/       # Zustand vanilla stores + Context providers + hooks
├── actions/      # Next.js server actions (API calls to backend)
├── hooks/        # Custom React hooks
├── lib/          # Utilities
└── constants/    # Enums and constants
```

## Domain Layer (Backend)

When adding a new entity, create these components in order:

1. **Model** (`domain/models/*.model.ts`) — business logic owner
   - Private fields with `#` prefix, public getters
   - State-transition methods with validation guards (`markAsCompleted()`)
   - Never allows invalid states

2. **Mapper** (`domain/repositories/helpers/map-*.ts`) — Prisma entity → domain model
   - Function overloads for null-safety
   - Use `convertNullToUndefined()` for nullable fields
   - Maps ALL fields; no business logic

3. **Repository** (`domain/repositories/*.repository.ts`) — persistence only
   - Extends `Database` class (Prisma wrapper)
   - Always returns domain models (never raw Prisma entities)
   - Exports singleton: `export const xRepository = new XRepository()`

4. **Service** (`domain/services/*.service.ts`) — orchestrates logic
   - Uses constructor dependency injection with `#` private fields
   - Returns DTOs (not models) to the API layer via private `#toDto()` methods
   - Exports singleton: `export const xService = new XService(xRepository)`

5. **Factory** (`domain/factories/*.factory.ts`) — optional, for complex creation with validation

**Critical anti-patterns to avoid:**
- Business logic or state transitions in repositories — use model methods, then `repository.save(model)`
- Returning raw Prisma entities from repositories
- Controllers transforming data — services return DTOs, controllers pass them through

## API Layer (Backend)

- Route chain: `validator → validateRequest middleware → asyncHandler(controller.method)`
- Validators in `api/controllers/validators/` using `express-validator` (`body`, `param`, `query`)
- Request DTOs in `api/controllers/dtos/request/`, response DTOs in `api/controllers/dtos/response/`
- Auth: Clerk sets `req.user.id`; protected routes use `apiAuth` middleware
- Swagger docs at `/api-docs`; all routes need `@swagger` JSDoc comments

## Import Aliases (Backend)

```typescript
@domain/   → src/domain/
@api/      → src/api/
@infra/    → src/infra/
@config/   → src/config/
```

## Queue & Background Jobs (BullMQ)

Workers extend `Worker`, implement `handleJob()`, log `completed`/`failed` events, use exponential backoff (`attempts: 3`), and export a singleton. Cron processors implement `CronServiceProcessor` and must be registered in `processor-names.ts` and `cron-service-queue.ts`.

Always re-throw errors in job handlers so BullMQ's retry mechanism fires.

## Frontend Patterns

**Zustand stores** use vanilla `createStore` (not React-bound) wrapped in a Context Provider with a `useRef` guard to prevent recreation on re-renders. Export a custom hook per store for type-safe access.

**Forms** use React Hook Form + Zod (`zodResolver`) with shadcn/ui `Form`/`FormField`/`FormItem` components. Always define `defaultValues`.

**Components** are functional with TypeScript prop interfaces, set `displayName`, and only use `"use client"` when hooks, event handlers, or browser APIs are needed.

## Key Business Logic

- **Transaction → Notification**: After saving an EXPENSE, `TransactionService` fires `#evaluateThresholdsAsync()` in the background to check category spending vs. user weight preferences (threshold + 5% buffer).
- **Currency**: Transactions store both original `amount` and `amountUsd`. All analytics use `amountUsd` for consistency.
- **Category weights**: Defaults in `config/default-category-weights.ts`, merged with per-user overrides from the database.
- **Notifications**: Use `dedupeKey` (composite) to prevent duplicates; link resources via `resourceType` + `resourceId`.

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express 5, TypeScript 5.8, Prisma 6 (PostgreSQL) |
| Auth | Clerk (`@clerk/express` + `@clerk/nextjs`) |
| Queue | BullMQ 5 + Redis |
| AI | OpenAI API + Ollama |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| UI | Radix UI + shadcn/ui, Recharts, TanStack Table |
| State | Zustand 5 |
| Forms | React Hook Form + Zod |
| Testing | Jest 29 |
| Logging | Winston |
