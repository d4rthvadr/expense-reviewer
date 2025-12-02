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
          const budgetAmountConversion =
            await currencyConversionService.convertCurrency(
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
            budgetAmountConversion.convertedAmount -
            transactionAmount.convertedAmount;

          let utilizationPercentage = 0;
          let status: BudgetVsTransactionData['status'] = 'NO_BUDGET';

          if (budgetAmountConversion.convertedAmount > 0) {
            utilizationPercentage =
              (transactionAmount.convertedAmount /
                budgetAmountConversion.convertedAmount) *
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
            budgetAmount:
              Math.round(budgetAmountConversion.convertedAmount * 100) / 100,
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

  async getBudgets(
    dateFrom: Date,
    dateTo: Date,
    userId: string
  ): Promise<BudgetData[]> {
    try {
      // Validate date range if provided
      if (dateFrom && dateTo && dateFrom > dateTo) {
        throw new Error('Start date cannot be after end date');
      }

      // Set date to beginning and end of day for proper querying
      const adjustedDateFrom = dateFrom ? new Date(dateFrom) : undefined;
      const adjustedDateTo = dateTo ? new Date(dateTo) : undefined;

      if (adjustedDateFrom) {
        adjustedDateFrom.setHours(0, 0, 0, 0);
      }

      if (adjustedDateTo) {
        adjustedDateTo.setHours(23, 59, 59, 999);
      }

      log.info(
        `Retrieving budget data from analytics service${adjustedDateFrom && adjustedDateTo ? ` from ${adjustedDateFrom.toISOString()} to ${adjustedDateTo.toISOString()}` : ''}`
      );

      const budgets = await this.analyticsRepository.getBudgets(
        userId,
        adjustedDateFrom,
        adjustedDateTo
      );

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

  async getExpensesVsIncomeAnalytics(
    dateFrom: Date,
    dateTo: Date,
    groupBy: 'week' | 'month',
    userId: string,
    currency?: string
  ): Promise<{
    data: {
      period: string;
      periodLabel: string;
      cumulativeExpenses: number;
      cumulativeIncome: number;
      cumulativeNet: number;
      periodExpenses: number;
      periodIncome: number;
      periodNet: number;
    }[];
    meta: {
      currency: string;
      period: {
        from: string;
        to: string;
      };
      groupBy: string;
      totalExpenses: number;
      totalIncome: number;
      totalNet: number;
      totalExpenseCount: number;
      totalIncomeCount: number;
    };
  }> {
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

      // Get user's preferred currency (default to USD)
      const targetCurrency = currency || Currency.USD;
      if (userId) {
        // TODO: Fetch user and get their preferred currency
        // const user = await this.userRepository.findById(userId);
        // targetCurrency = user?.currency || Currency.USD;
      }

      // Get raw period data from repository
      const rawData = await this.analyticsRepository.getExpensesVsIncomeData(
        adjustedDateFrom,
        adjustedDateTo,
        groupBy,
        userId
      );

      // Calculate cumulative data
      let cumulativeExpenses = 0;
      let cumulativeIncome = 0;

      const periodData = rawData.map(
        (item: {
          period_date: Date;
          period_expenses: number;
          period_income: number;
        }) => {
          const periodExpenses = Number(item.period_expenses);
          const periodIncome = Number(item.period_income);
          const periodNet = periodIncome - periodExpenses;

          cumulativeExpenses += periodExpenses;
          cumulativeIncome += periodIncome;
          const cumulativeNet = cumulativeIncome - cumulativeExpenses;

          // Format period label
          const periodDate = new Date(item.period_date);
          let periodLabel: string;

          if (groupBy === 'week') {
            const weekNum = Math.ceil(periodDate.getDate() / 7);
            const monthName = periodDate.toLocaleDateString('en-US', {
              month: 'short',
            });
            const year = periodDate.getFullYear();
            periodLabel = `Week ${weekNum}, ${monthName} ${year}`;
          } else {
            periodLabel = periodDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            });
          }

          return {
            period: item.period_date.toISOString().split('T')[0],
            periodLabel,
            cumulativeExpenses: Math.round(cumulativeExpenses * 100) / 100,
            cumulativeIncome: Math.round(cumulativeIncome * 100) / 100,
            cumulativeNet: Math.round(cumulativeNet * 100) / 100,
            periodExpenses: Math.round(periodExpenses * 100) / 100,
            periodIncome: Math.round(periodIncome * 100) / 100,
            periodNet: Math.round(periodNet * 100) / 100,
          };
        }
      );

      // Calculate totals for meta
      const totalExpenses = cumulativeExpenses;
      const totalIncome = cumulativeIncome;
      const totalNet = totalIncome - totalExpenses;

      // Get total counts
      const totalCounts =
        await this.analyticsRepository.getExpensesVsIncomeTotal(
          adjustedDateFrom,
          adjustedDateTo,
          userId
        );

      const meta = {
        currency: targetCurrency,
        period: {
          from: adjustedDateFrom.toISOString(),
          to: adjustedDateTo.toISOString(),
        },
        groupBy,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalExpenseCount: Number(totalCounts.expense_count),
        totalIncomeCount: Number(totalCounts.income_count),
      };

      log.info(
        `Expenses vs income analytics retrieved successfully: ${periodData.length} periods`
      );

      return {
        data: periodData,
        meta,
      };
    } catch (error) {
      log.error({
        message: 'Error in expenses vs income analytics service',
        error,
        code: 'EXPENSES_VS_INCOME_SERVICE_ERROR',
      });
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(analyticsRepository);
