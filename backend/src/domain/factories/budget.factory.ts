import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { BudgetModel } from '@domain/models/budget.model';

interface BudgetCreateDataDto {
  name?: string;
  userId?: string;
  amount: number;
  description?: string;
  category: Category;
  currency?: Currency;
}
export class BudgetFactory {
  /**
   * Creates a new BudgetModel instance from the provided data.
   * @param data - The data to create the budget model.
   * @returns A new BudgetModel instance.
   */
  static createBudget(data: BudgetCreateDataDto): BudgetModel {
    const { name, category, amount, description, currency, userId } = data;

    return new BudgetModel({
      name,
      amount,
      category,
      currency,
      description,
      userId,
    });
  }
}
