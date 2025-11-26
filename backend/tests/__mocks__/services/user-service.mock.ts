import { UserService } from '@domain/services/user.service';

export const createMockUserService = () => {
  return {
    find: jest.fn(),
    findUnprocessedUsersForPeriod: jest.fn(),
    findById: jest.fn(),
    findByClerkId: jest.fn(),
    create: jest.fn(),
    createFromClerk: jest.fn(),
    update: jest.fn(),
    updateLastLogin: jest.fn(),
  } as unknown as UserService;
};
