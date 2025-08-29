import { Response, Request } from 'express';
import { RequestBodyType } from '../types/request-body.type';
import {
  transactionReviewService,
  TransactionReviewService,
} from '@domain/services/transaction-review.service';
import { log } from '@infra/logger';
import { RequestQueryType } from './utils/parse-query-options';
import { PaginatedInputDto } from './dtos/request/paginated-input-request.dto';
import { startOfMonth, endOfMonth } from 'date-fns';

interface CreateTransactionReviewRequestDto {
  reviewText: string;
}

interface UpdateTransactionReviewRequestDto {
  reviewText?: string;
}

interface TransactionReviewFilters {
  dateFrom?: string;
  dateTo?: string;
  includeTransactions?: string;
}

export class TransactionReviewController {
  #transactionReviewService: TransactionReviewService;

  constructor(transactionReviewService: TransactionReviewService) {
    this.#transactionReviewService = transactionReviewService;
  }

  find = async (
    req: RequestQueryType<PaginatedInputDto<TransactionReviewFilters>>,
    res: Response
  ) => {
    const { limit = 10, offset = 0, filters = {} } = req.query;
    const { dateFrom, dateTo, includeTransactions } = filters;
    const userId = req.user.id;

    // Default to current month if no dates provided
    const currentDate = new Date();
    const defaultDateFrom = dateFrom
      ? new Date(dateFrom)
      : startOfMonth(currentDate);
    const defaultDateTo = dateTo ? new Date(dateTo) : endOfMonth(currentDate);

    log.info(
      `Finding transaction reviews for user ${userId} from ${defaultDateFrom} to ${defaultDateTo}`
    );

    const query = {
      userId,
      dateFrom: defaultDateFrom,
      dateTo: defaultDateTo,
      limit: parseInt(limit.toString(), 10),
      offset: parseInt(offset.toString(), 10),
      includeTransactions: includeTransactions === 'true',
    };

    const transactionReviewListResult =
      await this.#transactionReviewService.find(query, {
        limit: query.limit,
        offset: query.offset,
      });

    res.status(200).json(transactionReviewListResult);
  };

  findOne = async (req: Request<{ reviewId: string }>, res: Response) => {
    const reviewId: string = req.params.reviewId;
    log.info(`Find transaction review with id ${reviewId}`);

    const foundTransactionReview =
      await this.#transactionReviewService.findById(reviewId, req.user.id);

    res.status(200).json(foundTransactionReview);
  };

  create = async (
    req: RequestBodyType<CreateTransactionReviewRequestDto>,
    res: Response
  ) => {
    log.info(
      `Creating transaction review with data | meta: ${JSON.stringify(req.body)}`
    );

    const createdTransactionReview =
      await this.#transactionReviewService.create(req.body, req.user.id);

    res.status(201).json(createdTransactionReview);
  };

  update = async (
    req: Request<
      { reviewId: string },
      unknown,
      UpdateTransactionReviewRequestDto,
      unknown
    >,
    res: Response
  ) => {
    const reviewId: string = req.params.reviewId;
    log.info(`Updating transaction review with id ${reviewId}`);

    // Ensure reviewText is provided for update
    if (!req.body.reviewText) {
      return res
        .status(400)
        .json({ error: 'reviewText is required for update' });
    }

    const updatedTransactionReview =
      await this.#transactionReviewService.update(
        reviewId,
        { reviewText: req.body.reviewText },
        req.user.id
      );

    res.status(200).json(updatedTransactionReview);
  };

  delete = async (
    req: Request<{ reviewId: string }, unknown, unknown, unknown>,
    res: Response
  ) => {
    const reviewId: string = req.params.reviewId;
    await this.#transactionReviewService.delete(reviewId, req.user.id);

    res.status(204).send();
  };
}

export const transactionReviewController = new TransactionReviewController(
  transactionReviewService
);
