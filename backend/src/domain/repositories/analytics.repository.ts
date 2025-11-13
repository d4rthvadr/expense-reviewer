import { Currency } from '@domain/enum/currency.enum';
import { Database, db } from '@infra/db/database';
import { log } from '@infra/logger';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

// Configure Day.js plugins
dayjs.extend(isoWeek);

export interface TransactionAnalyticsData {
  period: string;
  totalAmount: number;
  transactionCount: number;
}

export interface BudgetData {
  category: string;
  budgetAmount: number;
  currency: string;
  createdAt: Date;
}

export interface BudgetVsTransactionData {
  category: string;
  budgetAmount: number;
  transactionAmount: number;
  currency: Currency;
  utilizationPercentage: number;
  remaining: number;
  status: 'UNDER_BUDGET' | 'OVER_BUDGET' | 'ON_BUDGET' | 'NO_BUDGET';
}

export interface AnalyticsFilters {
  dateFrom: Date;
  dateTo: Date;
  groupBy: 'day' | 'week' | 'month';
  userId: string;
  transactionType?: 'EXPENSE' | 'INCOME'; // Optional filter for transaction type
}

// Interface for raw SQL results
interface RawAnalyticsResult {
  period_date: Date;
  total_amount: number;
  transaction_count: bigint; // PostgreSQL COUNT returns bigint
}

interface BudgetVsTransactionRawResult {
  category: string;
  budget_amount_usd: number;
  transaction_amount_usd: number;
}

export class AnalyticsRepository {
  // eslint-disable-next-line no-unused-vars
  constructor(private db: Database) {}

  async getTotalTransactionsOverTime(
    filters: AnalyticsFilters
  ): Promise<TransactionAnalyticsData[]> {
    try {
      // Use SQL aggregation for efficient database-level processing
      const sqlResults = await this.getTransactionAggregatedDataFromDB(
        filters.dateFrom,
        filters.dateTo,
        filters.groupBy,
        filters.userId,
        filters.transactionType
      );

      log.info(
        `Processed ${sqlResults.length} aggregated periods for analytics`
      );

      // Format periods using Day.js to maintain exact current behavior
      return sqlResults
        .map((row: RawAnalyticsResult) => ({
          period: dayjs(row.period_date).format('YYYY-MM-DD'),
          totalAmount: row.total_amount,
          transactionCount: Number(row.transaction_count), // Convert bigint to number
        }))
        .sort((a, b) => a.period.localeCompare(b.period)); // Sort by period to maintain current sorting behavior
    } catch (error) {
      log.error({
        message: 'Error fetching transaction analytics',
        error,
        code: 'ANALYTICS_FETCH_ERROR',
      });
      throw error;
    }
  }

  private async getTransactionAggregatedDataFromDB(
    dateFrom: Date,
    dateTo: Date,
    groupBy: 'day' | 'week' | 'month',
    userId?: string,
    transactionType?: 'EXPENSE' | 'INCOME'
  ): Promise<RawAnalyticsResult[]> {
    const params: unknown[] = [dateFrom, dateTo];
    let query: string;

    if (userId) {
      // Query with userId filtering directly on Transaction table
      const truncateFunction = this.getSQLDateTruncateFunction(groupBy);

      let whereClause = `"createdAt" >= $1 AND "createdAt" <= $2 AND "userId" = $3`;
      if (transactionType) {
        whereClause += ` AND "type" = $4`;
        params.push(transactionType);
      }

      query = `
        SELECT 
          ${truncateFunction} as period_date,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count
        FROM "Transaction" 
        WHERE ${whereClause}
        GROUP BY ${truncateFunction}
        ORDER BY period_date
      `;
      params.push(userId);
    } else {
      // Simple query without userId filtering
      const truncateFunction = this.getSQLDateTruncateFunction(groupBy);

      let whereClause = `"createdAt" >= $1 AND "createdAt" <= $2`;
      if (transactionType) {
        whereClause += ` AND "type" = $3`;
        params.push(transactionType);
      }

      query = `
        SELECT 
          ${truncateFunction} as period_date,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count
        FROM "Transaction" 
        WHERE ${whereClause}
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

  async getBudgetVsTransactionData(
    dateFrom: Date,
    dateTo: Date,
    userId: string
  ): Promise<BudgetVsTransactionRawResult[]> {
    try {
      log.info(
        'Fetching budget vs transaction comparison data using USD amounts'
      );

      const query = `
        WITH budget_totals AS (
          SELECT 
            category,
            SUM("amountUsd") as budget_amount_usd
          FROM "Budget" 
          WHERE "createdAt" >= $1 
            AND "createdAt" <= $2
            AND "userId" = $3
          GROUP BY category
        ),
        expense_totals AS (
          SELECT 
            category,
            SUM("amountUsd") as transaction_amount_usd
          FROM "Transaction"
          WHERE "createdAt" >= $1 
            AND "createdAt" <= $2
            AND "userId" = $3
            AND "type" = 'EXPENSE'
          GROUP BY category
        )
        SELECT 
          COALESCE(bt.category, et.category) as category,
          COALESCE(bt.budget_amount_usd, 0) as budget_amount_usd,
          COALESCE(et.transaction_amount_usd, 0) as transaction_amount_usd
        FROM budget_totals bt
        FULL OUTER JOIN expense_totals et ON bt.category = et.category
        ORDER BY category;
      `;

      const results = await this.db.$queryRawUnsafe<
        BudgetVsTransactionRawResult[]
      >(query, dateFrom, dateTo, userId);

      log.info(
        `Retrieved ${results.length} budget vs transaction comparisons using USD amounts for user ${userId}`
      );
      return results;
    } catch (error) {
      log.error({
        message: 'Error fetching budget vs transaction data',
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

  async getExpensesVsIncomeData(
    dateFrom: Date,
    dateTo: Date,
    groupBy: 'week' | 'month',
    userId: string
  ): Promise<
    {
      period_date: Date;
      period_expenses: number;
      period_income: number;
    }[]
  > {
    try {
      const truncateFunction = this.getSQLDateTruncateFunction(groupBy);
      const params = [dateFrom, dateTo, userId];

      const query = `
        SELECT 
          ${truncateFunction} as period_date,
          SUM(CASE WHEN "type" = 'EXPENSE' THEN "amountUsd" ELSE 0 END) as period_expenses,
          SUM(CASE WHEN "type" = 'INCOME' THEN "amountUsd" ELSE 0 END) as period_income
        FROM "Transaction" 
        WHERE "createdAt" >= $1 AND "createdAt" <= $2 AND "userId" = $3
        GROUP BY ${truncateFunction}
        ORDER BY period_date
      `;

      const results = await this.db.$queryRawUnsafe<
        {
          period_date: Date;
          period_expenses: number;
          period_income: number;
        }[]
      >(query, ...params);

      log.info(
        `Retrieved ${results.length} periods for expenses vs income analysis`
      );
      return results;
    } catch (error) {
      log.error({
        message: 'Error fetching expenses vs income data',
        error,
        code: 'EXPENSES_VS_INCOME_FETCH_ERROR',
      });
      throw error;
    }
  }

  async getExpensesVsIncomeTotal(
    dateFrom: Date,
    dateTo: Date,
    userId: string
  ): Promise<{
    expense_count: bigint;
    income_count: bigint;
  }> {
    try {
      const params = [dateFrom, dateTo, userId];

      const query = `
        SELECT 
          COUNT(CASE WHEN "type" = 'EXPENSE' THEN 1 END) as expense_count,
          COUNT(CASE WHEN "type" = 'INCOME' THEN 1 END) as income_count
        FROM "Transaction" 
        WHERE "createdAt" >= $1 AND "createdAt" <= $2 AND "userId" = $3
      `;

      const results = await this.db.$queryRawUnsafe<
        {
          expense_count: bigint;
          income_count: bigint;
        }[]
      >(query, ...params);

      return (
        results[0] || { expense_count: BigInt(0), income_count: BigInt(0) }
      );
    } catch (error) {
      log.error({
        message: 'Error fetching expenses vs income totals',
        error,
        code: 'EXPENSES_VS_INCOME_TOTAL_ERROR',
      });
      throw error;
    }
  }
}

export const analyticsRepository = new AnalyticsRepository(db);
