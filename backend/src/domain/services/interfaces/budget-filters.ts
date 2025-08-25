import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';

export type BudgetFindFilters = {
  currency?: Currency;
  category?: Category;
};
