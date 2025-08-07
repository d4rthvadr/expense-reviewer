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
      const { dateFrom, dateTo, groupBy, userId } =
        req.query as Partial<AnalyticsRequestDto>;

      // Parse dates (validation already handled by middleware)
      const parsedDateFrom = new Date(dateFrom!);
      const parsedDateTo = new Date(dateTo!);

      const data = await analyticsService.getExpensesOverTime(
        parsedDateFrom,
        parsedDateTo,
        groupBy as 'day' | 'week' | 'month',
        userId
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
      const { userId } = req.query as { userId?: string };

      const data = await analyticsService.getBudgets(userId);

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
}

export const analyticsController = new AnalyticsController();
