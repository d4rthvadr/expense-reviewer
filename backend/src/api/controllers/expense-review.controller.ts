import { log } from '@infra/logger';
import { Request, Response } from 'express';
import {
  expenseReviewService,
  ExpenseReviewService,
} from '@domain/services/expense-review.service';
import { RequestQueryType } from './utils/parse-query-options';
import { PaginatedInputDto } from './dtos/request/paginated-input-request.dto';
import { startOfMonth, endOfMonth } from 'date-fns';

interface ExpenseReviewFilters {
  dateFrom?: string;
  dateTo?: string;
  includeExpenses?: string;
}

export class ExpenseReviewController {
  #expenseReviewService: ExpenseReviewService;

  constructor(expenseReviewService: ExpenseReviewService) {
    this.#expenseReviewService = expenseReviewService;
  }

  find = async (
    req: RequestQueryType<PaginatedInputDto<ExpenseReviewFilters>>,
    res: Response
  ) => {
    const { limit = 10, offset = 0, filters = {} } = req.query;
    const { dateFrom, dateTo, includeExpenses } = filters;
    const userId = req.user.id;

    // Default to current month if no dates provided
    const currentDate = new Date();
    const defaultDateFrom = dateFrom
      ? new Date(dateFrom)
      : startOfMonth(currentDate);
    const defaultDateTo = dateTo ? new Date(dateTo) : endOfMonth(currentDate);

    log.info(
      `Finding expense reviews for user ${userId} from ${defaultDateFrom} to ${defaultDateTo}`
    );

    const query = {
      userId,
      dateFrom: defaultDateFrom,
      dateTo: defaultDateTo,
      limit: parseInt(limit.toString(), 10),
      offset: parseInt(offset.toString(), 10),
      includeExpenses: includeExpenses === 'true',
    };

    const expenseReviewListResult =
      await this.#expenseReviewService.find(query);

    res.status(200).json(expenseReviewListResult);
  };

  findOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const expenseReview = await this.#expenseReviewService.findById(
      id,
      req.user.id
    );

    res.status(200).json(expenseReview);
  };
}

export const expenseReviewController = new ExpenseReviewController(
  expenseReviewService
);
