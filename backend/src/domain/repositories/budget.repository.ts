import { Budget as BudgetEntity, Category } from '../../../generated/prisma';
import { BudgetModel } from '@domain/models/budget.model';
import { Database } from '../../db/database';
import { log } from '@libs/logger';
import { mapBudget } from './helpers/map-budget';

// TODO: Make this interface generic and shared
interface ListBudgetDto {
  filters: Record<string, unknown>;
  sort: {
    sortBy: string;
    sortDir: string;
  };
  limit: number;
  offset: number;
}

export class BudgetRepository extends Database {
  async findById(budgetId: string): Promise<BudgetModel | null> {
    try {
      const budget: BudgetEntity | null = await this.budget.findFirst({
        where: {
          id: budgetId,
        },
      });

      return mapBudget(budget);
    } catch (error) {
      log.error({
        message: `An error occurred while fetching budget with ID ${budgetId}:`,
        error,
        code: '',
      });

      throw error;
    }
  }

  async find(
    data: ListBudgetDto
  ): Promise<{ data: BudgetModel[]; total: number }> {
    log.info(`Finding budgets with filters: ${JSON.stringify(data)}`);
    const { filters, limit, offset } = data;

    try {
      const [records, total]: [BudgetEntity[], number] =
        await this.$transaction([
          this.budget.findMany({
            where: filters,
            take: limit,
            skip: offset * limit,
            orderBy: {
              [data.sort.sortBy]: data.sort.sortDir,
            },
          }),
          this.budget.count({
            where: filters,
            take: limit,
            skip: offset,
          }),
        ]);

      const budgets = records.map((expense: BudgetEntity) =>
        mapBudget(expense)
      );

      return {
        data: budgets,
        total,
      };
    } catch (error) {
      log.error({
        message: 'An error occurred while fetching budgets:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async save(data: BudgetModel): Promise<BudgetModel> {
    try {
      const savedBudget: BudgetEntity = await this.budget.upsert({
        where: {
          id: data.id,
        },
        create: {
          id: data.id,
          name: data.name,
          description: data.description,
          amount: data.amount,
          category: data.category as unknown as Category, // TODO: Fix this
          currency: data.currency,
          userId: data.userId,
        },
        update: {
          name: data.name,
          amount: data.amount,
          userId: data.userId,
          category: data.category as unknown as Category, // TODO: Fix this
          currency: data.currency,
          description: data.description,
        },
      });

      return mapBudget(savedBudget);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving budget:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async delete(id: string): Promise<BudgetModel> {
    try {
      const deletedBudget = await this.budget.delete({
        where: {
          id,
        },
      });

      return mapBudget(deletedBudget);
    } catch (error) {
      log.error({
        message: `An error occurred while deleting budget: ${id}`,
        error,
        code: '',
      });

      throw error;
    }
  }
}
