import { Budget as BudgetEntity, Category } from '../../../generated/prisma';
import { BudgetModel } from '@domain/models/budget.model';
import { log } from '@infra/logger';
import { mapBudget } from './helpers/map-budget';
import { Database } from '@infra/db/database';
import { QueryParams } from '@domain/services/interfaces/query-params';
import { BudgetFindFilters } from '@domain/services/interfaces/budget-filters';

export class BudgetRepository extends Database {
  async findById(
    budgetId: string,
    userId: string
  ): Promise<BudgetModel | null> {
    try {
      const budget: BudgetEntity | null = await this.budget.findFirst({
        where: {
          id: budgetId,
          userId: userId,
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
    data: QueryParams<BudgetFindFilters>,
    userId: string
  ): Promise<{ data: BudgetModel[]; total: number }> {
    log.info(`Finding budgets with filters: ${JSON.stringify(data)}`);
    const { filters, limit, offset } = data;

    const whereQuery = {
      ...filters,
      userId,
    };

    try {
      const [records, total]: [BudgetEntity[], number] =
        await this.$transaction([
          this.budget.findMany({
            where: whereQuery,
            take: limit,
            skip: offset,
            orderBy: {
              [data.sort.sortBy]: data.sort.sortDir,
            },
          }),
          this.budget.count(),
        ]);

      const budgets = records.map((budget: BudgetEntity) => mapBudget(budget));

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
          amountUsd: data.amount, // TODO: Assuming amount is in USD
          category: data.category as unknown as Category, // TODO: Fix this
          currency: data.currency,
          userId: data.userId,
          isRecurring: data.isRecurring,
          recurringTemplateId: data.recurringTemplateId,
        },
        update: {
          name: data.name,
          amount: data.amount,
          amountUsd: data.amount, // TODO: Assuming amount is in USD
          userId: data.userId,
          category: data.category as unknown as Category, // TODO: Fix this
          currency: data.currency,
          description: data.description,
          isRecurring: data.isRecurring,
          recurringTemplateId: data.recurringTemplateId,
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

  async delete(id: string, userId: string): Promise<BudgetModel> {
    try {
      const deletedBudget = await this.budget.delete({
        where: {
          id,
          userId,
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

export const budgetRepository = new BudgetRepository();
