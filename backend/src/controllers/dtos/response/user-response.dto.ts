import { Currency } from '@domain/enum/currency.enum';

export interface UserResponseDto {
  id: string;
  name?: string;
  currency?: Currency;
  email: string;
  createdAt: Date;
}
