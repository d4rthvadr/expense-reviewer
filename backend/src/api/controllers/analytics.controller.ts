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

      // Validate required parameters
      if (!dateFrom || !dateTo || !groupBy) {
        res.status(400).json({
          success: false,
          message:
            'Missing required parameters: dateFrom, dateTo, and groupBy are required',
        });
        return;
      }

      // Validate groupBy parameter
      if (!['day', 'week', 'month'].includes(groupBy)) {
        res.status(400).json({
          success: false,
          message: 'groupBy must be one of: day, week, month',
        });
        return;
      }

      // Parse and validate dates
      const parsedDateFrom = new Date(dateFrom);
      const parsedDateTo = new Date(dateTo);

      if (isNaN(parsedDateFrom.getTime()) || isNaN(parsedDateTo.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Please use ISO date strings.',
        });
        return;
      }

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
      console.log('Error in analytics controller:', error);
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
}

export const analyticsController = new AnalyticsController();
