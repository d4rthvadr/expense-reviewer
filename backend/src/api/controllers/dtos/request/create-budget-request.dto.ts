import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';

export interface CreateBudgetRequestDto {
  name?: string;
  amount: number;
  currency: Currency;
  description?: string;
  category: Category;
  isRecurring?: boolean;
  recurringTemplateId?: string;
}
