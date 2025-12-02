import { Request, Response } from 'express';
import { analyticsService } from '@domain/services/analytics.service';
import {
  AnalyticsRequestDto,
  AnalyticsApiResponse,
} from './dtos/analytics.dto';

export class AnalyticsController {
  async getTransactionsOverTime(req: Request, res: Response): Promise<void> {
    const { dateFrom, dateTo, groupBy, transactionType } = req.query as Partial<
      AnalyticsRequestDto & { transactionType?: 'EXPENSE' | 'INCOME' }
    >;

    // Parse dates (validation already handled by middleware)
    const parsedDateFrom = new Date(dateFrom!);
    const parsedDateTo = new Date(dateTo!);

    const data = await analyticsService.getTransactionsOverTime(
      parsedDateFrom,
      parsedDateTo,
      groupBy as 'day' | 'week' | 'month',
      req.user.id,
      transactionType
    );

    const response: AnalyticsApiResponse = {
      success: true,
      data,
      message: `Analytics data retrieved for ${data.length} periods`,
    };

    res.status(200).json(response);
  }

  async getBudgets(req: Request, res: Response): Promise<void> {
    const { dateFrom, dateTo } = req.query as {
      dateFrom?: string;
      dateTo?: string;
    };

    // Set default date range to last 30 days if not provided
    let parsedDateFrom: Date;
    let parsedDateTo: Date;

    if (!dateFrom || !dateTo) {
      const now = new Date();
      parsedDateFrom = new Date(now);
      parsedDateFrom.setDate(now.getDate() - 30); // 30 days ago
      parsedDateTo = new Date(now); // Today
    } else {
      parsedDateFrom = new Date(dateFrom);
      parsedDateTo = new Date(dateTo);

      // Validate date formats
      if (isNaN(parsedDateFrom.getTime()) || isNaN(parsedDateTo.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD format',
        });
        return;
      }

      if (parsedDateFrom > parsedDateTo) {
        res.status(400).json({
          success: false,
          message: 'dateFrom must be before or equal to dateTo',
        });
        return;
      }
    }

    const data = await analyticsService.getBudgets(
      parsedDateFrom,
      parsedDateTo,
      req.user.id
    );

    const response = {
      success: true,
      data,
      message: `Budget data retrieved for ${data.length} categories`,
    };

    res.status(200).json(response);
  }

  async getBudgetVsTransactions(req: Request, res: Response): Promise<void> {
    const { dateFrom, dateTo } = req.query as {
      dateFrom?: string;
      dateTo?: string;
    };

    // TODO: should go into middleware
    if (!dateFrom || !dateTo) {
      res.status(400).json({
        success: false,
        message: 'dateFrom and dateTo are required parameters',
      });
      return;
    }

    // Parse and validate dates
    const parsedDateFrom = new Date(dateFrom);
    const parsedDateTo = new Date(dateTo);

    if (isNaN(parsedDateFrom.getTime()) || isNaN(parsedDateTo.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD format',
      });
      return;
    }

    if (parsedDateFrom > parsedDateTo) {
      res.status(400).json({
        success: false,
        message: 'dateFrom must be before or equal to dateTo',
      });
      return;
    }

    const data = await analyticsService.getBudgetVsTransactions(
      parsedDateFrom,
      parsedDateTo,
      req.user.id
    );

    const response = {
      success: true,
      data,
      message: `Budget vs transaction comparison retrieved for ${data.length} categories`,
    };

    res.status(200).json(response);
  }

  async getExpensesVsIncome(req: Request, res: Response): Promise<void> {
    const { dateFrom, dateTo, groupBy, currency } = req.query as {
      dateFrom?: string;
      dateTo?: string;
      groupBy?: 'week' | 'month';
      currency?: string;
    };

    // Validate required parameters
    if (!groupBy) {
      res.status(400).json({
        success: false,
        message: 'groupBy parameter is required. Must be "week" or "month"',
      });
      return;
    }

    if (!['week', 'month'].includes(groupBy)) {
      res.status(400).json({
        success: false,
        message: 'Invalid groupBy parameter. Must be "week" or "month"',
      });
      return;
    }

    // Set default date range to current month if not provided
    let parsedDateFrom: Date;
    let parsedDateTo: Date;

    if (!dateFrom || !dateTo) {
      const now = new Date();
      parsedDateFrom = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
      parsedDateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    } else {
      // Validate date formats
      parsedDateFrom = new Date(dateFrom);
      parsedDateTo = new Date(dateTo);

      if (isNaN(parsedDateFrom.getTime()) || isNaN(parsedDateTo.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD format',
        });
        return;
      }

      if (parsedDateFrom > parsedDateTo) {
        res.status(400).json({
          success: false,
          message: 'dateFrom must be before or equal to dateTo',
        });
        return;
      }

      // Check for date range too large (2 years max)
      const maxRange = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
      if (parsedDateTo.getTime() - parsedDateFrom.getTime() > maxRange) {
        res.status(400).json({
          success: false,
          message: 'Date range too large. Maximum allowed range is 2 years',
        });
        return;
      }
    }

    const data = await analyticsService.getExpensesVsIncomeAnalytics(
      parsedDateFrom,
      parsedDateTo,
      groupBy,
      req.user.id,
      currency
    );

    // Return empty results if no data found (not an error)
    const response = {
      success: true,
      data: data.data,
      meta: data.meta,
      message:
        data.data.length > 0
          ? `Expenses vs income analytics retrieved for ${data.data.length} periods`
          : 'No transaction data found for the specified date range',
    };

    res.status(200).json(response);
  }
}

export const analyticsController = new AnalyticsController();
