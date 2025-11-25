# Frontend Instructions

## Stack

- Use React with TypeScript.
- For Next.js: prefer server components where possible.
- CSS: Use TailwindCSS.
- State: Use React Query for async data and Zustand for client-side state.

## Component Rules

- Components must be small, pure, and easy to compose.
- Side-effects belong in hooks, not components.
- Avoid prop drilling; lift shared state to hooks.

## API Layer

- Abstract all fetch calls behind a /lib/api folder.
- Use zod to validate API responses.
- Never access fetch directly inside UI components.

## Performance

- Use memo, useCallback, and useMemo only when necessary.
- Prefer streaming or incremental static regeneration in Next.js where applicable.

## UI/UX Conventions

- Buttons must follow the project’s UI kit variations.
- Use accessible HTML and aria attributes.
- Provide skeleton loaders for async UI states.

## Domain Rules

Users can create tasks, update them, and complete them.  
Completing a task triggers a UI toast and refreshes the task list via React Query invalidation.
