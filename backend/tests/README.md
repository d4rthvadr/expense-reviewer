# Testing Infrastructure

Comprehensive testing setup with reusable mocks and fixtures.

## Directory Structure

```
src/__tests__/
├── __mocks__/              # Reusable mock factories
│   ├── repositories/       # Repository layer mocks
│   │   ├── user-repository.mock.ts
│   │   ├── analysis-run-repository.mock.ts
│   │   ├── transaction-repository.mock.ts
│   │   ├── budget-repository.mock.ts
│   │   ├── notification-repository.mock.ts
│   │   └── index.ts
│   ├── services/          # Service layer mocks
│   │   ├── user-service.mock.ts
│   │   ├── spending-analysis-service.mock.ts
│   │   ├── transaction-service.mock.ts
│   │   ├── budget-service.mock.ts
│   │   ├── notification-service.mock.ts
│   │   └── index.ts
│   ├── index.ts           # Central export
│   └── README.md          # Detailed usage guide
└── fixtures/              # Test data factories
    ├── user.fixture.ts
    ├── analysis-run.fixture.ts
    └── index.ts
```

## Quick Start

### Using Mocks

```typescript
import {
  createMockUserService,
  createMockAnalysisRunRepository,
} from '@tests/__mocks__';

describe('MyFeature', () => {
  let mockUserService: ReturnType<typeof createMockUserService>;
  let mockRepository: ReturnType<typeof createMockAnalysisRunRepository>;

  beforeEach(() => {
    mockUserService = createMockUserService();
    mockRepository = createMockAnalysisRunRepository();
  });

  it('should work', async () => {
    mockUserService.find.mockResolvedValue([]);
    // ... test logic
  });
});
```

### Using Fixtures

```typescript
import { createMockUser, createMockAnalysisRun } from '@tests/fixtures';

const user = createMockUser({ email: 'custom@example.com' });
const run = createMockAnalysisRun({ status: AnalysisRunStatus.COMPLETED });
```

## Configuration

### TypeScript Path Alias

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "@tests/*": ["__tests__/*"]
    }
  }
}
```

### Jest Module Mapper

**jest.config.js:**

```javascript
{
  moduleNameMapper: {
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
  }
}
```

## Available Mocks

### Repositories

- `createMockUserRepository()`
- `createMockAnalysisRunRepository()`
- `createMockTransactionRepository()`
- `createMockBudgetRepository()`
- `createMockNotificationRepository()`

### Services

- `createMockUserService()`
- `createMockSpendingAnalysisService()`
- `createMockTransactionService()`
- `createMockBudgetService()`
- `createMockNotificationService()`

### Fixtures

- `createMockUser(overrides?)`
- `createMockAnalysisRun(overrides?)`

## Example Test

```typescript
import { CategoryWeightAnalysisProcessor } from '../category-weight-analysis.processor';
import {
  createMockUserService,
  createMockSpendingAnalysisService,
  createMockAnalysisRunRepository,
} from '@tests/__mocks__';
import { createMockUser, createMockAnalysisRun } from '@tests/fixtures';

describe('CategoryWeightAnalysisProcessor', () => {
  let processor: CategoryWeightAnalysisProcessor;
  let mockUserService: ReturnType<typeof createMockUserService>;
  let mockAnalysisService: ReturnType<typeof createMockSpendingAnalysisService>;
  let mockRepository: ReturnType<typeof createMockAnalysisRunRepository>;

  beforeEach(() => {
    mockUserService = createMockUserService();
    mockAnalysisService = createMockSpendingAnalysisService();
    mockRepository = createMockAnalysisRunRepository();

    processor = new CategoryWeightAnalysisProcessor(
      mockUserService,
      mockAnalysisService,
      mockRepository
    );
  });

  it('should process users', async () => {
    const mockUsers = [createMockUser()];
    const mockRun = createMockAnalysisRun();

    mockUserService.find.mockResolvedValue(mockUsers);
    mockRepository.startOrSkip.mockResolvedValue(mockRun);

    await processor.process({ id: 'job-1' });

    expect(mockUserService.find).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Fresh Instances**: Always create new mock instances in `beforeEach`
2. **Type Safety**: Use `ReturnType<typeof createMockX>` for proper typing
3. **Fixtures for Data**: Use fixtures for creating test data, not raw objects
4. **Centralized Mocks**: Add new mocks to `__mocks__/` for reuse
5. **Descriptive Tests**: Use clear test descriptions and arrange/act/assert pattern
