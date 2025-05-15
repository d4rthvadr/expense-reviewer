import { Response, Request } from 'express';
import { RequestBodyType } from '../types/request-body.type';
import { ExpenseService } from '../domain/services/expense.service';
import { CreateExpenseRequestDto } from './dtos/request/create-expense-request.dto';
import { log } from '../libs/logger';
import { ExpenseResponseDto } from './dtos/response/expense-response.dto';
import { PaginatedInputDto } from './dtos/request/paginated-input-request.dto';
import { UpdateExpenseRequestDto } from './dtos/request/update-expense-request.dto';

export type RequestQueryType<T> = Request<unknown, unknown, unknown, T>;

interface findFilters {
  expenseId?: string;
  type?: string;
  category?: string;
  createdAt?: string;
}

const parseQueryOptions = (
  req: RequestQueryType<PaginatedInputDto<findFilters>>
) => {
  console.log('req.query', req.query);
  let {
    sortBy = 'createdAt',
    sortDir = 'desc',
    offset = 0,
    limit = 10,
    ...filters
  } = req.query;

  if (typeof limit === 'string') {
    limit = parseInt(limit);
  }
  if (typeof offset === 'string') {
    offset = parseInt(offset);
  }

  return { sort: { sortBy, sortDir }, offset, limit, filters };
};
export class ExpenseController {
  #expenseService: ExpenseService;
  constructor(expenseService: ExpenseService) {
    this.#expenseService = expenseService;
  }

  find = async (
    req: RequestQueryType<PaginatedInputDto<findFilters>>,
    res: Response
  ) => {
    const query = parseQueryOptions(req);

    const expenseListResult = await this.#expenseService.find({
      ...query,
      filters: {
        ...query.filters,
        // userId,
      },
    });

    res.status(200).json(expenseListResult);
  };

  findOne = async (req: Request<{ expenseId: string }>, res: Response) => {
    const expenseId: string = req.params.expenseId;
    log.info(`Find expense with id ${expenseId}`);
    const foundExpenseDto: ExpenseResponseDto =
      await await this.#expenseService.findOne(expenseId);
    res.status(200).json(foundExpenseDto);
  };

  create = async (
    req: RequestBodyType<CreateExpenseRequestDto>,
    res: Response
  ) => {
    log.info(`Creating expense with data | meta: ${JSON.stringify(req.body)}`);
    const createdExpenseDto: ExpenseResponseDto =
      await this.#expenseService.create(req.body);

    res.status(201).json(createdExpenseDto);
  };

  update = async (
    req: Request<
      { expenseId: string },
      unknown,
      UpdateExpenseRequestDto,
      unknown
    >,
    res: Response
  ) => {
    const expenseId: string = req.params.expenseId;
    log.info(`Updating expense with id ${expenseId}`);

    req.body;
    const updatedExpenseDto: ExpenseResponseDto =
      await this.#expenseService.update(expenseId, req.body);

    res.status(200).json(updatedExpenseDto);
  };

  delete = async (
    req: Request<{ expenseId: string }, unknown, unknown, unknown>,
    res: Response
  ) => {
    const expenseId: string = req.params.expenseId;
    await this.#expenseService.delete(expenseId);

    res.status(204).send();
  };
}
