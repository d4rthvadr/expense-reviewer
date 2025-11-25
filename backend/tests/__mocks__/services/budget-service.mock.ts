import { BudgetService } from '@domain/services/budget.service';

export const createMockBudgetService = () => {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as BudgetService;
};
