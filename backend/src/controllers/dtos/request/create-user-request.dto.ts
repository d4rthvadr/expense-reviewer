import { Currency } from '@domain/enum/currency.enum';
import { UserStatus } from '@domain/enum/user-status.enum';

export interface CreateUserRequestDto {
  name?: string;
  email: string;
  status?: UserStatus;
  password: string;
  currency?: Currency;
}
