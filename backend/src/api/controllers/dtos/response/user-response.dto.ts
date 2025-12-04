import { Currency } from '@domain/enum/currency.enum';
import { UserStatus } from '@domain/enum/user-status.enum';

export interface UserResponseDto {
  id: string;
  name?: string;
  status?: UserStatus;
  currency?: Currency;
  lastRecurSync?: Date;
  email: string;
  createdAt: Date;
  hasSeenWelcome: boolean;
}
