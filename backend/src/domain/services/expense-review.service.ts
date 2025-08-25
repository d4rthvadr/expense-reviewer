import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';
import { ExpenseReviewModel } from '@domain/models/expense-review.model';
import {
  expenseReviewRepository,
  ExpenseReviewRepository,
} from '@domain/repositories/expense-review.repository';
import { log } from '@infra/logger';
import { PaginatedResultDto } from '@api/controllers/dtos/response/paginated-response.dto';
import { startOfMonth, endOfMonth } from 'date-fns';
import { ExpenseReviewResponseDto } from '../../api/controllers/dtos/response/expense-review-response.dto';
import { ExpenseReviewFactory } from '@domain/factories/expense-reviewe.factory';

interface ExpenseReviewQueryParams {
  userId: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit: number;
  offset: number;
  includeExpenses?: boolean;
}

export class ExpenseReviewService {
  #expenseReviewRepository: ExpenseReviewRepository;

  constructor(expenseReviewRepository: ExpenseReviewRepository) {
    this.#expenseReviewRepository = expenseReviewRepository;
  }

  async find(
    query: ExpenseReviewQueryParams
  ): Promise<PaginatedResultDto<ExpenseReviewResponseDto>> {
    // Default to current month if no date filters provided
    const currentDate = new Date();
    const defaultQuery = {
      ...query,
      dateFrom: query.dateFrom ?? startOfMonth(currentDate),
      dateTo: query.dateTo ?? endOfMonth(currentDate),
      includeExpenses: query.includeExpenses || false,
    };

    const { data, total } =
      await this.#expenseReviewRepository.find(defaultQuery);

    return {
      data: data.map((expenseReview) =>
        this.#toExpenseReviewDto(expenseReview)
      ),
      limit: defaultQuery.limit,
      page: Math.floor(defaultQuery.offset / defaultQuery.limit) + 1,
      totalPages: Math.ceil(total / defaultQuery.limit),
      hasNext: defaultQuery.offset + defaultQuery.limit < total,
      hasPrevious: defaultQuery.offset > 0,
      total,
    };
  }

  async findById(
    expenseReviewId: string,
    userId: string
  ): Promise<ExpenseReviewResponseDto> {
    log.info(
      `Finding expense review by id: ${expenseReviewId} for user: ${userId}`
    );

    const expenseReview: ExpenseReviewModel = await this.findExpenseReviewById(
      expenseReviewId,
      userId
    );
    return this.#toExpenseReviewDto(expenseReview);
  }

  private async findExpenseReviewById(
    expenseReviewId: string,
    userId: string
  ): Promise<ExpenseReviewModel> {
    const expenseReview = await this.#expenseReviewRepository.findById(
      expenseReviewId,
      userId
    );

    this.validateExpenseReviewFound(expenseReview, expenseReviewId);
    return expenseReview;
  }

  validateExpenseReviewFound(
    expenseReview: ExpenseReviewModel | null,
    expenseReviewId: string
  ): asserts expenseReview is ExpenseReviewModel {
    if (!expenseReview) {
      log.error(`Expense review not found with id: ${expenseReviewId}`);
      throw new ResourceNotFoundException(
        `Expense review not found with id: ${expenseReviewId}`
      );
    }
  }

  async createReview(
    reviewText: string,
    userId: string
  ): Promise<ExpenseReviewModel> {
    log.info(`Creating expense review for user ID: ${userId}`);

    const newReview = ExpenseReviewFactory.createExpenseReview({
      reviewText,
      userId,
    });

    return await this.#expenseReviewRepository.save(newReview);
  }

  #toExpenseReviewDto(data: ExpenseReviewModel): ExpenseReviewResponseDto {
    const { id, reviewText, createdAt, updatedAt, expense } = data;

    return {
      id,
      reviewText,
      createdAt,
      updatedAt,
      ...(expense && { expense }),
    };
  }
}

export const expenseReviewService = new ExpenseReviewService(
  expenseReviewRepository
);
