import { TransactionService } from '@domain/services/transaction.service';

export const createMockTransactionService = () => {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as TransactionService;
};
