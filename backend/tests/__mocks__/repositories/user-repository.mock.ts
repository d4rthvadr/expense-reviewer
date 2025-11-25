import { UserRepository } from '@domain/repositories/user.repository';

export const createMockUserRepository = () => {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    updateLastLogin: jest.fn(),
  } as unknown as UserRepository;
};
