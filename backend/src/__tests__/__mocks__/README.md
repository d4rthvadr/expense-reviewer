# Test Mocks

Centralized mock factories for testing across the backend application.

## Structure

```
__mocks__/
├── repositories/       # Repository layer mocks
│   ├── user-repository.mock.ts
│   ├── analysis-run-repository.mock.ts
│   ├── transaction-repository.mock.ts
│   └── index.ts
├── services/          # Service layer mocks
│   ├── user-service.mock.ts
│   ├── spending-analysis-service.mock.ts
│   ├── transaction-service.mock.ts
│   └── index.ts
└── index.ts           # Main export
```

## Usage

Import mocks using the `@tests/__mocks__` alias:

```typescript
import {
  createMockUserService,
  createMockUserRepository,
  createMockAnalysisRunRepository,
} from '@tests/__mocks__';

describe('MyFeature', () => {
  let mockUserService: ReturnType<typeof createMockUserService>;

  beforeEach(() => {
    mockUserService = createMockUserService();
  });

  it('should do something', async () => {
    mockUserService.find.mockResolvedValue([
      /* mock data */
    ]);
    // ... test logic
  });
});
```

## Benefits

- **Consistency**: All tests use the same mock structure
- **DRY**: No duplicate mock definitions across test files
- **Type Safety**: Mocks maintain TypeScript types from actual implementations
- **Maintainability**: Update mock methods in one place when interfaces change

## Adding New Mocks

1. Create mock file in appropriate subdirectory (`repositories/` or `services/`)
2. Export factory function that returns Jest mocked instance
3. Add export to subdirectory's `index.ts`
4. Mock is automatically available via main `@tests/__mocks__` import

Example:

```typescript
// repositories/budget-repository.mock.ts
import { BudgetRepository } from '@domain/repositories/budget.repository';

export const createMockBudgetRepository = () => {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  } as unknown as BudgetRepository;
};
```
