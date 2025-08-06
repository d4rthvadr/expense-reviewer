import { Database, db } from '@infra/db/database';
import { log } from '@infra/logger';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

// Configure Day.js plugins
dayjs.extend(isoWeek);

export interface ExpenseAnalyticsData {
  period: string;
  totalAmount: number;
  expenseCount: number;
}

export interface AnalyticsFilters {
  dateFrom: Date;
  dateTo: Date;
  groupBy: 'day' | 'week' | 'month';
  userId?: string; // Will be used later when you add it to ExpenseItem
}

interface ExpenseItemData {
  id: string;
  amount: number;
  createdAt: Date;
}

interface GroupedExpenseItems {
  [period: string]: {
    totalAmount: number;
    count: number;
  };
}

export class AnalyticsRepository {
  constructor(private db: Database) {}

  async getTotalExpensesOverTime(
    filters: AnalyticsFilters
  ): Promise<ExpenseAnalyticsData[]> {
    const { dateFrom, dateTo, groupBy } = filters;

    try {
      // Fetch expense items using Prisma

      const expenseItems = await this.db.expenseItem.findMany({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
          // userId filtering removed - will be added later when you add userId to ExpenseItem
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
        },
      });

      log.info(
        `Fetched ${expenseItems.length} expense items for analytics processing`
      );

      // Group expense items by period
      const grouped = this.groupExpenseItemsByPeriod(expenseItems, groupBy);

      // Convert to response format and sort
      return this.formatGroupedData(grouped);
    } catch (error) {
      log.error({
        message: 'Error fetching expense items analytics',
        error,
        code: 'ANALYTICS_FETCH_ERROR',
      });
      throw error;
    }
  }

  private groupExpenseItemsByPeriod(
    expenseItems: ExpenseItemData[],
    groupBy: 'day' | 'week' | 'month'
  ): GroupedExpenseItems {
    const grouped = expenseItems.reduce<GroupedExpenseItems>(
      (acc, expenseItem) => {
        const periodKey = this.getPeriodKey(expenseItem.createdAt, groupBy);
        const existing = acc[periodKey] ?? { totalAmount: 0, count: 0 };

        acc[periodKey] = {
          totalAmount: existing.totalAmount + expenseItem.amount,
          count: existing.count + 1,
        };

        return acc;
      },
      {}
    );

    return grouped;
  }

  private getPeriodKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    const d = dayjs(date);

    switch (groupBy) {
      case 'day':
        return d.format('YYYY-MM-DD');
      case 'week':
        return `${d.isoWeekYear()}-W${d.isoWeek().toString().padStart(2, '0')}`;
      case 'month':
        return d.format('YYYY-MM');
      default:
        return d.format('YYYY-MM-DD');
    }
  }

  private formatGroupedData(
    grouped: GroupedExpenseItems
  ): ExpenseAnalyticsData[] {
    const result: ExpenseAnalyticsData[] = Object.entries(grouped)
      .map(([period, data]) => ({
        period,
        totalAmount: Math.round(data.totalAmount * 100) / 100, // Round to 2 decimal places
        expenseCount: data.count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return result;
  }
}

export const analyticsRepository = new AnalyticsRepository(db);
