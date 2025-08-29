import {
  AnalyticsRepository,
  TransactionAnalyticsData,
  BudgetData,
  BudgetVsTransactionData,
  AnalyticsFilters,
  analyticsRepository,
} from '@domain/repositories/analytics.repository';
import { currencyConversionService } from '@domain/services/currency-conversion.service';
import { Currency } from '@domain/enum/currency.enum';
import { log } from '@infra/logger';

export class AnalyticsService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async getTransactionsOverTime(
    dateFrom: Date,
    dateTo: Date,
    groupBy: 'day' | 'week' | 'month',
    userId: string,
    transactionType?: 'EXPENSE' | 'INCOME'
  ): Promise<TransactionAnalyticsData[]> {
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
        transactionType,
      };

      const data =
        await this.analyticsRepository.getTotalTransactionsOverTime(filters);

      log.info(
        `Transaction analytics data retrieved successfully: ${data.length} periods using filters ${JSON.stringify(filters)}`
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

  async getBudgetVsTransactions(
    dateFrom: Date,
    dateTo: Date,
    userId: string
  ): Promise<BudgetVsTransactionData[]> {
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
        `Fetching budget vs transaction data from ${adjustedDateFrom.toISOString()} to ${adjustedDateTo.toISOString()}`
      );

      // Get raw USD data from repository
      const rawData = await this.analyticsRepository.getBudgetVsTransactionData(
        adjustedDateFrom,
        adjustedDateTo,
        userId
      );

      // Get user's preferred currency (default to USD)
      const userCurrency = Currency.USD;
      if (userId) {
        // TODO: Fetch user and get their preferred currency
        // const user = await this.userRepository.findById(userId);
        // userCurrency = user?.currency || Currency.USD;
      }

      // Transform raw USD data to user's preferred currency
      const data: BudgetVsTransactionData[] = await Promise.all(
        rawData.map(async (item) => {
          const budgetAmountUsd = Number(item.budget_amount_usd);
          const transactionAmountUsd = Number(item.transaction_amount_usd);

          // Convert from USD to user's preferred currency
          const budgetAmount = await currencyConversionService.convertCurrency(
            budgetAmountUsd,
            Currency.USD,
            userCurrency
          );

          const transactionAmount =
            await currencyConversionService.convertCurrency(
              transactionAmountUsd,
              Currency.USD,
              userCurrency
            );

          const remaining =
            budgetAmount.convertedAmount - transactionAmount.convertedAmount;

          let utilizationPercentage = 0;
          let status: BudgetVsTransactionData['status'] = 'NO_BUDGET';

          if (budgetAmount.convertedAmount > 0) {
            utilizationPercentage =
              (transactionAmount.convertedAmount /
                budgetAmount.convertedAmount) *
              100;

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
            budgetAmount: Math.round(budgetAmount.convertedAmount * 100) / 100,
            transactionAmount:
              Math.round(transactionAmount.convertedAmount * 100) / 100,
            currency: userCurrency,
            utilizationPercentage:
              Math.round(utilizationPercentage * 100) / 100,
            remaining: Math.round(remaining * 100) / 100,
            status,
          };
        })
      );

      // Sort by transaction amount descending, then by category name
      const sortedData = data.sort((a, b) => {
        if (b.transactionAmount !== a.transactionAmount) {
          return b.transactionAmount - a.transactionAmount;
        }
        return a.category.localeCompare(b.category);
      });

      log.info(
        `Budget vs transaction data retrieved successfully: ${sortedData.length} categories`
      );

      return sortedData;
    } catch (error) {
      log.error({
        message: 'Error in budget vs transaction service',
        error,
        code: 'BUDGET_VS_TRANSACTION_SERVICE_ERROR',
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
