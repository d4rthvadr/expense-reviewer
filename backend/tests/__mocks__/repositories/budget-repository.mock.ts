import { BudgetRepository } from '@domain/repositories/budget.repository';

export const createMockBudgetRepository = () => {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  } as unknown as BudgetRepository;
};
