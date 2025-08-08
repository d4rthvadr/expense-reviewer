import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { RecurringPeriod } from '@domain/enum/recurring-period.enum';
import { RecurringTemplateType } from '@domain/enum/recurring-template-type.enum';

export interface CreateRecurringTemplateRequestDto {
  name?: string;
  type: RecurringTemplateType;
  amount: number;
  isRecurring?: boolean;
  recurringPeriod?: RecurringPeriod;
  startDate?: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
  isActive?: boolean;
  currency?: Currency;
  category: Category;
  description?: string;
}
