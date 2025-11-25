import { UserModel } from '@domain/models/user.model';
import { UserStatus } from '@domain/enum/user-status.enum';
import { Currency } from '@domain/enum/currency.enum';

export const createMockUser = (overrides?: Partial<UserModel>): UserModel => {
  return new UserModel({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    status: UserStatus.ACTIVE,
    currency: Currency.USD,
    password: 'hashed-password',
    lastLogin: new Date('2025-11-25'),
    lastRecurSync: undefined,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-11-25'),
    ...overrides,
  });
};
