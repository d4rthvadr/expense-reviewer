import { Currency } from '@domain/enum/currency.enum';

export interface CreateUserRequestDto {
  name?: string;
  email: string;
  password: string;
  currency?: Currency;
}
