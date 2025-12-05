import { Response, Request } from 'express';
import { RequestBodyType } from '../types/request-body.type';
import {
  transactionService,
  TransactionService,
} from '@domain/services/transaction.service';
import { TransactionResponseDto } from './dtos/response/transaction-response.dto';
import { log } from '@infra/logger';
import { parseQueryParams } from './utils/parse-query-options';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionType } from '@domain/enum/transaction-type.enum';
import { Category } from '@domain/enum/category.enum';
import { TransactionFindFilters } from '@domain/services/interfaces/transaction-filters';

interface CreateTransactionRequestDto {
  name: string;
  description?: string;
  category: Category;
  qty: number;
  amount: number;
  currency: Currency;
  type: TransactionType;
}

interface UpdateTransactionRequestDto {
  name?: string;
  description?: string;
  category: Category;
  qty?: number;
  amount: number;
  currency: Currency;
  type: TransactionType;
}

export class TransactionController {
  #transactionService: TransactionService;

  constructor(transactionService: TransactionService) {
    this.#transactionService = transactionService;
  }

  find = async (req: Request, res: Response) => {
    const parsedQuery = parseQueryParams<TransactionFindFilters>(req, (req) => {
      const filters: TransactionFindFilters = {};
      if (req.query.type) {
        filters.type = req.query.type as TransactionType;
      }

      // Handle date range filtering with 30-day default
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;

      let parsedDateFrom: Date;
      let parsedDateTo: Date;

      if (!dateFrom || !dateTo) {
        // Default to last 30 days
        const now = new Date();
        parsedDateFrom = new Date(now);
        parsedDateFrom.setDate(now.getDate() - 30);
        parsedDateTo = new Date(now);
      } else {
        parsedDateFrom = new Date(dateFrom);
        parsedDateTo = new Date(dateTo);
      }

      // Set to beginning and end of day
      parsedDateFrom.setHours(0, 0, 0, 0);
      parsedDateTo.setHours(23, 59, 59, 999);

      filters.createdAt = {
        gte: parsedDateFrom,
        lte: parsedDateTo,
      };

      return filters;
    });

    const transactionListResult = await this.#transactionService.find(
      parsedQuery,
      req.user.id
    );

    res.status(200).json(transactionListResult);
  };

  findOne = async (req: Request<{ transactionId: string }>, res: Response) => {
    const transactionId: string = req.params.transactionId;
    log.info(`Find transaction with id ${transactionId}`);

    const foundTransactionDto: TransactionResponseDto =
      await this.#transactionService.findOne(transactionId, req.user.id);

    res.status(200).json(foundTransactionDto);
  };

  create = async (
    req: RequestBodyType<CreateTransactionRequestDto>,
    res: Response
  ) => {
    log.info(
      `Creating transaction with data | meta: ${JSON.stringify(req.body)}`
    );

    const createdTransactionDto: TransactionResponseDto =
      await this.#transactionService.create({
        ...req.body,
        userId: req.user.id,
      });

    res.status(201).json(createdTransactionDto);
  };

  update = async (
    req: Request<
      { transactionId: string },
      unknown,
      UpdateTransactionRequestDto,
      unknown
    >,
    res: Response
  ) => {
    const transactionId: string = req.params.transactionId;
    log.info(`Updating transaction with id ${transactionId}`);

    const updatedTransactionDto: TransactionResponseDto =
      await this.#transactionService.update(transactionId, req.user.id, {
        ...req.body,
        userId: req.user.id,
      });

    res.status(200).json(updatedTransactionDto);
  };

  delete = async (
    req: Request<{ transactionId: string }, unknown, unknown, unknown>,
    res: Response
  ) => {
    const transactionId: string = req.params.transactionId;
    await this.#transactionService.delete(transactionId, req.user.id);

    res.status(204).send();
  };
}

export const transactionController = new TransactionController(
  transactionService
);
