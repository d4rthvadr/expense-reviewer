import { Currency } from '@domain/enum/currency.enum';
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

export interface BudgetData {
  category: string;
  budgetAmount: number;
  currency: string;
  createdAt: Date;
}

export interface BudgetVsExpenseData {
  category: string;
  budgetAmount: number;
  expenseAmount: number;
  currency: Currency;
  utilizationPercentage: number;
  remaining: number;
  status: 'UNDER_BUDGET' | 'OVER_BUDGET' | 'ON_BUDGET' | 'NO_BUDGET';
}

export interface AnalyticsFilters {
  dateFrom: Date;
  dateTo: Date;
  groupBy: 'day' | 'week' | 'month';
  userId?: string; // Will be used later when you add it to Expense
}

// Interface for raw SQL results
interface RawAnalyticsResult {
  period_date: Date;
  total_amount: number;
  expense_count: bigint; // PostgreSQL COUNT returns bigint
}

interface BudgetVsExpenseRawResult {
  category: string;
  budget_amount_usd: number;
  expense_amount_usd: number;
}

export class AnalyticsRepository {
  constructor(private db: Database) {}

  async getTotalExpensesOverTime(
    filters: AnalyticsFilters
  ): Promise<ExpenseAnalyticsData[]> {
    const { dateFrom, dateTo, groupBy, userId } = filters;

    try {
      // Use SQL aggregation for efficient database-level processing
      const sqlResults = await this.getExpenseAggregatedDataFromDB(
        dateFrom,
        dateTo,
        groupBy,
        userId
      );

      log.info(
        `Processed ${sqlResults.length} aggregated periods for analytics`
      );

      // Format periods using Day.js to maintain exact current behavior
      return sqlResults
        .map((row) => ({
          period: this.getPeriodKey(row.period_date, groupBy), // Reuse existing Day.js logic
          totalAmount: Math.round(row.total_amount * 100) / 100, // Round to 2 decimal places
          expenseCount: Number(row.expense_count), // Convert bigint to number
        }))
        .sort((a, b) => a.period.localeCompare(b.period)); // Sort by period to maintain current sorting behavior
    } catch (error) {
      log.error({
        message: 'Error fetching expense items analytics',
        error,
        code: 'ANALYTICS_FETCH_ERROR',
      });
      throw error;
    }
  }

  private async getExpenseAggregatedDataFromDB(
    dateFrom: Date,
    dateTo: Date,
    groupBy: 'day' | 'week' | 'month',
    userId?: string
  ): Promise<RawAnalyticsResult[]> {
    const params: unknown[] = [dateFrom, dateTo];
    let query: string;

    if (userId) {
      // Query with userId filtering directly on Expense table
      const truncateFunction = this.getSQLDateTruncateFunction(groupBy);

      query = `
        SELECT 
          ${truncateFunction} as period_date,
          SUM(amount) as total_amount,
          COUNT(*) as expense_count
        FROM "Expense" 
        WHERE "createdAt" >= $1 AND "createdAt" <= $2 AND "userId" = $3
        GROUP BY ${truncateFunction}
        ORDER BY period_date
      `;
      params.push(userId);
    } else {
      // Simple query without userId filtering
      const truncateFunction = this.getSQLDateTruncateFunction(groupBy);

      query = `
        SELECT 
          ${truncateFunction} as period_date,
          SUM(amount) as total_amount,
          COUNT(*) as expense_count
        FROM "Expense" 
        WHERE "createdAt" >= $1 AND "createdAt" <= $2
        GROUP BY ${truncateFunction}
        ORDER BY period_date
      `;
    }

    // Execute the raw SQL query with parameterized arguments
    const results = await this.db.$queryRawUnsafe<RawAnalyticsResult[]>(
      query,
      ...params
    );

    return results;
  }

  private getSQLDateTruncateFunction(
    groupBy: 'day' | 'week' | 'month'
  ): string {
    const column = '"createdAt"';

    switch (groupBy) {
      case 'day':
        return `DATE_TRUNC('day', ${column})`;
      case 'week':
        return `DATE_TRUNC('week', ${column})`; // PostgreSQL week
      case 'month':
        return `DATE_TRUNC('month', ${column})`;
      default:
        return `DATE_TRUNC('day', ${column})`;
    }
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

  async getBudgetVsExpenseData(
    dateFrom: Date,
    dateTo: Date
  ): Promise<BudgetVsExpenseRawResult[]> {
    try {
      log.info('Fetching budget vs expense comparison data using USD amounts');

      const query = `
        WITH budget_totals AS (
          SELECT 
            category,
            SUM("amountUsd") as budget_amount_usd
          FROM "Budget" 
          WHERE "createdAt" >= $1 
            AND "createdAt" <= $2
          GROUP BY category
        ),
        expense_totals AS (
          SELECT 
            category,
            SUM("amountUsd") as expense_amount_usd
          FROM "Expense"
          WHERE "createdAt" >= $1 
            AND "createdAt" <= $2
          GROUP BY category
        )
        SELECT 
          COALESCE(bt.category, et.category) as category,
          COALESCE(bt.budget_amount_usd, 0) as budget_amount_usd,
          COALESCE(et.expense_amount_usd, 0) as expense_amount_usd
        FROM budget_totals bt
        FULL OUTER JOIN expense_totals et ON bt.category = et.category
        ORDER BY category;
      `;

      const results = await this.db.$queryRawUnsafe<BudgetVsExpenseRawResult[]>(
        query,
        dateFrom,
        dateTo
      );

      log.info(
        `Retrieved ${results.length} budget vs expense comparisons using USD amounts`
      );
      return results;
    } catch (error) {
      log.error({
        message: 'Error fetching budget vs expense data',
        error,
        code: 'BUDGET_VS_EXPENSE_FETCH_ERROR',
      });
      throw error;
    }
  }

  async getBudgets(userId?: string): Promise<BudgetData[]> {
    try {
      log.info('Fetching budget data with latest budget per category');

      // Use DISTINCT ON to get latest budget per category
      const budgets = await this.db.budget.findMany({
        where: userId ? { userId } : undefined,
        distinct: ['category'],
        orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
        select: {
          category: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
      });

      log.info(`Retrieved ${budgets.length} unique budget categories`);

      return budgets.map((budget) => ({
        category: budget.category,
        budgetAmount: budget.amount,
        currency: budget.currency || Currency.USD,
        createdAt: budget.createdAt,
      }));
    } catch (error) {
      log.error({
        message: 'Error fetching budgets',
        error,
        code: 'BUDGET_FETCH_ERROR',
      });
      throw error;
    }
  }
}

export const analyticsRepository = new AnalyticsRepository(db);
