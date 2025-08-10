import {
  AnalyticsRepository,
  ExpenseAnalyticsData,
  BudgetData,
  BudgetVsExpenseData,
  AnalyticsFilters,
  analyticsRepository,
} from '@domain/repositories/analytics.repository';
import { log } from '@infra/logger';

export class AnalyticsService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async getExpensesOverTime(
    dateFrom: Date,
    dateTo: Date,
    groupBy: 'day' | 'week' | 'month',
    userId?: string
  ): Promise<ExpenseAnalyticsData[]> {
    try {
      // Validate date range
      if (dateFrom > dateTo) {
        throw new Error('Start date cannot be after end date');
      }

      // Set date to beginning and end of day for proper querying
      const adjustedDateFrom = new Date(dateFrom);
      adjustedDateFrom.setHours(0, 0, 0, 0);

      const adjustedDateTo = new Date(dateTo);
      adjustedDateTo.setHours(23, 59, 59, 999);

      const filters: AnalyticsFilters = {
        dateFrom: adjustedDateFrom,
        dateTo: adjustedDateTo,
        groupBy,
        userId,
      };

      log.info(
        `Fetching expenses over time with filters ${JSON.stringify(filters)}`
      );

      const data =
        await this.analyticsRepository.getTotalExpensesOverTime(filters);

      log.info(
        `Expenses analytics data retrieved successfully: ${data.length} periods`
      );

      return data;
    } catch (error) {
      log.error({
        message: 'Error in analytics service',
        error,
        code: 'ANALYTICS_SERVICE_ERROR',
      });
      throw error;
    }
  }

  async getBudgetVsExpenses(
    dateFrom: Date,
    dateTo: Date
  ): Promise<BudgetVsExpenseData[]> {
    try {
      // Validate date range
      if (dateFrom > dateTo) {
        throw new Error('Start date cannot be after end date');
      }

      // Set date to beginning and end of day for proper querying
      const adjustedDateFrom = new Date(dateFrom);
      adjustedDateFrom.setHours(0, 0, 0, 0);

      const adjustedDateTo = new Date(dateTo);
      adjustedDateTo.setHours(23, 59, 59, 999);

      log.info(
        `Fetching budget vs expense data from ${adjustedDateFrom.toISOString()} to ${adjustedDateTo.toISOString()}`
      );

      const rawData = await this.analyticsRepository.getBudgetVsExpenseData(
        adjustedDateFrom,
        adjustedDateTo
      );

      // Transform raw data into formatted response
      const data: BudgetVsExpenseData[] = rawData.map((item) => {
        const budgetAmount = Number(item.budget_amount);
        const expenseAmount = Number(item.expense_amount);
        const remaining = budgetAmount - expenseAmount;

        let utilizationPercentage = 0;
        let status: BudgetVsExpenseData['status'] = 'NO_BUDGET';

        if (budgetAmount > 0) {
          utilizationPercentage = (expenseAmount / budgetAmount) * 100;

          if (utilizationPercentage < 100) {
            status = 'UNDER_BUDGET';
          } else if (utilizationPercentage > 100) {
            status = 'OVER_BUDGET';
          } else {
            status = 'ON_BUDGET';
          }
        }

        return {
          category: item.category,
          budgetAmount: Math.round(budgetAmount * 100) / 100,
          expenseAmount: Math.round(expenseAmount * 100) / 100,
          utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
          remaining: Math.round(remaining * 100) / 100,
          status,
        };
      });

      // Sort by expense amount descending, then by category name
      const sortedData = data.sort((a, b) => {
        if (b.expenseAmount !== a.expenseAmount) {
          return b.expenseAmount - a.expenseAmount;
        }
        return a.category.localeCompare(b.category);
      });

      log.info(
        `Budget vs expense data retrieved successfully: ${sortedData.length} categories`
      );

      return sortedData;
    } catch (error) {
      log.error({
        message: 'Error in budget vs expense service',
        error,
        code: 'BUDGET_VS_EXPENSE_SERVICE_ERROR',
      });
      throw error;
    }
  }

  async getBudgets(userId?: string): Promise<BudgetData[]> {
    try {
      log.info('Retrieving budget data from analytics service');

      const budgets = await this.analyticsRepository.getBudgets(userId);

      log.info(
        `Budget data retrieved successfully: ${budgets.length} categories`
      );

      return budgets;
    } catch (error) {
      log.error({
        message: 'Error in budget service',
        error,
        code: 'BUDGET_SERVICE_ERROR',
      });
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(analyticsRepository);
