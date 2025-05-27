import { BudgetModel } from 'domain/models/budget.model';
import { Category } from '../../domain/models/enum/category.enum';

interface BudgetCreateDataDto {
  name?: string;
  userId?: string;
  amount: number;
  description?: string;
  category: Category;
}
export class BudgetFactory {
  /**
   * Creates a new UserModel instance from the provided data.
   * @param data - The data to create the user model.
   * @returns A new UserModel instance.
   */
  static createBudget(data: BudgetCreateDataDto): BudgetModel {
    const { name, category, amount, description, userId } = data;

    return new BudgetModel({
      name,
      amount,
      category,
      description,
      userId,
    });
  }
}
