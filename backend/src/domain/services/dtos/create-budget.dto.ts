import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';

export interface CreateBudgetDto {
  name?: string;
  userId: string;
  amount: number;
  description?: string;
  category: Category;
  currency?: Currency;
  isRecurring?: boolean;
  recurringTemplateId?: string;
}
