import { Request, Response } from 'express';
import { analyticsService } from '@domain/services/analytics.service';
import {
  AnalyticsRequestDto,
  AnalyticsApiResponse,
} from './dtos/analytics.dto';
import { log } from '@infra/logger';

export class AnalyticsController {
  async getExpensesOverTime(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo, groupBy } =
        req.query as Partial<AnalyticsRequestDto>;

      // Parse dates (validation already handled by middleware)
      const parsedDateFrom = new Date(dateFrom!);
      const parsedDateTo = new Date(dateTo!);

      const data = await analyticsService.getExpensesOverTime(
        parsedDateFrom,
        parsedDateTo,
        groupBy as 'day' | 'week' | 'month',
        req.user?.id
      );

      const response: AnalyticsApiResponse = {
        success: true,
        data,
        message: `Analytics data retrieved for ${data.length} periods`,
      };

      res.status(200).json(response);
    } catch (error) {
      log.error({
        message: 'Error in analytics controller',
        error,
        code: 'ANALYTICS_CONTROLLER_ERROR',
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving analytics data',
      });
    }
  }

  async getBudgets(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getBudgets(req.user?.id);

      const response = {
        success: true,
        data,
        message: `Budget data retrieved for ${data.length} categories`,
      };

      res.status(200).json(response);
    } catch (error) {
      log.error({
        message: 'Error in budget controller',
        error,
        code: 'BUDGET_CONTROLLER_ERROR',
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving budget data',
      });
    }
  }

  async getBudgetVsExpenses(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo } = req.query as {
        dateFrom?: string;
        dateTo?: string;
      };

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

      const data = await analyticsService.getBudgetVsExpenses(
        parsedDateFrom,
        parsedDateTo,
        req.user?.id
      );

      const response = {
        success: true,
        data,
        message: `Budget vs expense comparison retrieved for ${data.length} categories`,
      };

      res.status(200).json(response);
    } catch (error) {
      log.error({
        message: 'Error in budget vs expense controller',
        error,
        code: 'BUDGET_VS_EXPENSE_CONTROLLER_ERROR',
      });

      res.status(500).json({
        success: false,
        message:
          'Internal server error while retrieving budget vs expense data',
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
