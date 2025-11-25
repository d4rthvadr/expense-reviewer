# Backend Instructions

## Language and Style

- Use TypeScript with strict mode enabled.
- Prefer async/await over Promise chains.
- Use named imports and avoid default exports.
- Follow functional error handling using never-throw business rules.
- Use zod for runtime validation of external inputs.

## Architecture

- Follow Clean Architecture and DDD principles.
- Domain layer must not import from infrastructure or framework layers.
- Controllers must not contain business logic.
- Services contain orchestrations but no persistence logic.
- Repositories encapsulate data storage using Prisma.
- Use dependency injection where appropriate.

## Patterns and Constraints

- All IDs must be branded types using `{ _brand: string }`.
- Use Result<T, E> or Either<L, R> structures for domain operations.
- Avoid static classes except for pure utility logic.
- All DB access must occur only inside repositories.
- Validation must be handled close to the boundary of the app.

## Security

- Never log sensitive data such as passwords or tokens.
- Always sanitize database inputs through Prisma or parameterized queries.
- Always validate request payloads with zod schemas.

## Testing

- Use Vitest or Jest for unit tests.
- Use test doubles (mocks) for repositories in domain tests.
- Do not hit real databases in unit tests.
- E2E tests may spin up an ephemeral Postgres container.

## API

- Use REST conventions.
- Responses must follow the structure: { success: boolean, data?, error? }.

## Documentation

- Add JSDoc for public-facing classes, domain services, and repository interfaces.

## Domain Knowledge

This system handles user accounts, tasks, notifications, and reporting.  
Tasks must always belong to a user.  
A notification can only be sent when the task enters a “completed” state.
