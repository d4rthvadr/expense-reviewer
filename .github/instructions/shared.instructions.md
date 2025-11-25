# Shared Instructions

## Coding Conventions

- Use absolute imports with configured path aliases.
- Prefer small, composable utilities over large helper files.
- All date/time logic uses Luxon (never use raw Date unless unavoidable).

## Folder Structure

- /domain contains pure business logic.
- /application contains orchestrations.
- /infrastructure contains external dependencies and adapters.
- /ui or /presentation contains components and route files.

## Naming

- Files use kebab-case.
- Types use PascalCase.
- Variables use camelCase.

## Error Handling

- Never throw raw Errors for domain failures — use Result/Either patterns.
- Boundary layers (controllers, adapters) may throw framework-specific errors.

## Logging

- Use structured logs with pino or a similar logger.
- Avoid console.log in production code.

## AI Usage Guidance

These instructions dictate how AI should:

- generate code,
- maintain architecture boundaries,
- follow style conventions,
- enforce domain invariants.
