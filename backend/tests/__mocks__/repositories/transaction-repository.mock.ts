import { TransactionRepository } from '@domain/repositories/transaction.repository';

export const createMockTransactionRepository = () => {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  } as unknown as TransactionRepository;
};
