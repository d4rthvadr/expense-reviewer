import {
  AnalyticsRepository,
  ExpenseAnalyticsData,
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
}

export const analyticsService = new AnalyticsService(analyticsRepository);
