import { log } from '@infra/logger';
import { TransactionReviewModel } from '@domain/models/transaction-review.model';
import {
  TransactionReviewRepository,
  transactionReviewRepository,
} from '@domain/repositories/transaction-review.repository';
import { TransactionReviewFactory } from '@domain/factories/transaction-review.factory';
import { TransactionReviewResponseDto } from '@api/controllers/dtos/response/transaction-review-response.dto';
import { PaginatedResultDto } from '@api/controllers/dtos/response/paginated-response.dto';
import { paginateDataResult } from '@api/controllers/utils/paginate-response';

interface CreateTransactionReviewDto {
  reviewText: string;
}

interface GetTransactionReviewsDto {
  userId: string;
  dateFrom: Date;
  dateTo: Date;
  includeTransactions?: boolean;
}

interface PaginationDto {
  limit: number;
  offset: number;
}

class TransactionReviewNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionReviewNotFoundException';
  }
}

interface FindTransactionReviewsQuery {
  userId: string;
  dateFrom: Date;
  dateTo: Date;
  limit: number;
  offset: number;
  includeTransactions: boolean;
}

export class TransactionReviewService {
  #transactionReviewRepository: TransactionReviewRepository;
  constructor(transactionReviewRepository: TransactionReviewRepository) {
    this.#transactionReviewRepository = transactionReviewRepository;
  }
  async find(
    data: GetTransactionReviewsDto,
    pagination: PaginationDto
  ): Promise<PaginatedResultDto<TransactionReviewResponseDto>> {
    try {
      const query: FindTransactionReviewsQuery = {
        userId: data.userId,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        limit: pagination.limit,
        offset: pagination.offset,
        includeTransactions: data.includeTransactions || false,
      };

      const result = await transactionReviewRepository.find(query);

      log.info({
        message: `Found ${result.data.length} transaction reviews for user ${data.userId}`,
      });

      return paginateDataResult(
        result.data.map((review) => this.#toTransactionReviewDto(review)),
        result.total,
        pagination.limit,
        pagination.offset
      );
    } catch (error) {
      log.error({
        message: 'Error finding transaction reviews:',
        error,
        code: 'TRANSACTION_REVIEWS_FIND_ERROR',
      });

      throw error;
    }
  }

  async findById(
    transactionReviewId: string,
    userId: string
  ): Promise<TransactionReviewResponseDto> {
    try {
      const transactionReview =
        await transactionReviewRepository.findById(transactionReviewId);

      if (!transactionReview || transactionReview.userId !== userId) {
        throw new TransactionReviewNotFoundException(
          `Transaction review with id ${transactionReviewId} not found for user ${userId}`
        );
      }

      log.info({
        message: `Found transaction review ${transactionReviewId} for user ${userId}`,
      });

      return this.#toTransactionReviewDto(transactionReview);
    } catch (error) {
      log.error({
        message: `Error finding transaction review ${transactionReviewId}:`,
        error,
        code: 'TRANSACTION_REVIEW_FIND_ERROR',
      });

      throw error;
    }
  }

  async create(
    data: CreateTransactionReviewDto,
    userId: string
  ): Promise<TransactionReviewResponseDto> {
    try {
      const transactionReview = new TransactionReviewModel({
        reviewText: data.reviewText,
        userId,
      });

      const savedTransactionReview =
        await transactionReviewRepository.save(transactionReview);

      log.info({
        message: `Created transaction review ${savedTransactionReview.id} for user ${userId}`,
      });

      return this.#toTransactionReviewDto(savedTransactionReview);
    } catch (error) {
      log.error({
        message: 'Error creating transaction review:',
        error,
        code: 'TRANSACTION_REVIEW_CREATE_ERROR',
      });

      throw error;
    }
  }

  /**
   * Creates multiple transaction reviews in a batch
   * @returns Number of reviews created
   */
  async createMany(
    reviews: Array<{ userId: string; reviewText: string }>
  ): Promise<number> {
    try {
      const count = await transactionReviewRepository.saveMany(reviews);
      log.info(`Successfully created ${count} transaction reviews in batch`);
      return count;
    } catch (error) {
      log.error({
        message: 'Error batch creating transaction reviews:',
        error,
        code: 'TRANSACTION_REVIEW_CREATE_MANY_ERROR',
      });
      throw error;
    }
  }

  async update(
    transactionReviewId: string,
    data: CreateTransactionReviewDto,
    userId: string
  ): Promise<TransactionReviewResponseDto> {
    try {
      // First verify the transaction review exists and belongs to the user
      const existingTransactionReview =
        await transactionReviewRepository.findById(transactionReviewId);

      if (
        !existingTransactionReview ||
        existingTransactionReview.userId !== userId
      ) {
        throw new TransactionReviewNotFoundException(
          `Transaction review with id ${transactionReviewId} not found for user ${userId}`
        );
      }

      // Update the transaction review
      const updatedTransactionReview = new TransactionReviewModel({
        id: existingTransactionReview.id,
        reviewText: data.reviewText,
        userId: existingTransactionReview.userId,
        transactions: existingTransactionReview.transactions,
        createdAt: existingTransactionReview.createdAt,
        updatedAt: new Date(),
      });

      const savedTransactionReview = await transactionReviewRepository.save(
        updatedTransactionReview
      );

      log.info({
        message: `Updated transaction review ${transactionReviewId} for user ${userId}`,
      });

      return this.#toTransactionReviewDto(savedTransactionReview);
    } catch (error) {
      log.error({
        message: `Error updating transaction review ${transactionReviewId}:`,
        error,
        code: 'TRANSACTION_REVIEW_UPDATE_ERROR',
      });

      throw error;
    }
  }

  async delete(transactionReviewId: string, userId: string): Promise<void> {
    try {
      // First verify the transaction review exists and belongs to the user
      const existingTransactionReview =
        await transactionReviewRepository.findById(transactionReviewId);

      if (
        !existingTransactionReview ||
        existingTransactionReview.userId !== userId
      ) {
        throw new TransactionReviewNotFoundException(
          `Transaction review with id ${transactionReviewId} not found for user ${userId}`
        );
      }

      // Delete the transaction review
      const deletedTransactionReview =
        await transactionReviewRepository.delete(transactionReviewId);

      if (!deletedTransactionReview) {
        throw new TransactionReviewNotFoundException(
          `Transaction review with id ${transactionReviewId} could not be deleted`
        );
      }

      log.info({
        message: `Deleted transaction review ${transactionReviewId} for user ${userId}`,
      });
    } catch (error) {
      log.error({
        message: `Error deleting transaction review ${transactionReviewId}:`,
        error,
        code: 'TRANSACTION_REVIEW_DELETE_ERROR',
      });

      throw error;
    }
  }

  async createReview(
    reviewText: string,
    userId: string
  ): Promise<TransactionReviewResponseDto> {
    log.info(`Creating transaction review for user ID: ${userId}`);

    const newReview = TransactionReviewFactory.createNew({
      reviewText,
      userId,
    });

    const savedReview = await this.#transactionReviewRepository.save(newReview);
    return this.#toTransactionReviewDto(savedReview);
  }

  #toTransactionReviewDto(
    data: TransactionReviewModel
  ): TransactionReviewResponseDto {
    const { id, reviewText, createdAt, updatedAt, userId, transactions } = data;
    return {
      id,
      reviewText,
      createdAt,
      updatedAt,
      userId,
      transactions,
    };
  }
}

// Create singleton instance
const transactionReviewService = new TransactionReviewService(
  transactionReviewRepository
);

export { transactionReviewService };
