import { log } from '@infra/logger';
import { Request, Response } from 'express';
import { RequestBodyType } from '../types/request-body.type';
import { budgetService, BudgetService } from '@domain/services/budget.service';
import { CreateBudgetRequestDto } from './dtos/request/create-budget-request.dto';
import { BudgetResponseDto } from './dtos/response/budget-response.dto';
import { UpdateBudgetRequestDto } from './dtos/request/update-budget-request.dto';
import {
  FindFilters,
  parseQueryOptions,
  RequestQueryType,
} from './utils/parse-query-options';
import { PaginatedInputDto } from './dtos/request/paginated-input-request.dto';

export class BudgetController {
  #budgetService: BudgetService;
  constructor(budgetService: BudgetService) {
    this.#budgetService = budgetService;
  }

  create = async (
    req: RequestBodyType<CreateBudgetRequestDto>,
    res: Response
  ) => {
    log.info(
      `Creating user with data: ${JSON.stringify({ data: req.body, userId: req.user?.id })}`
    );

    const createdBudget = await this.#budgetService.create({
      userId: req.user?.id,
      ...req.body,
    });

    return res.status(201).json(createdBudget);
  };

  find = async (
    req: RequestQueryType<PaginatedInputDto<FindFilters>>,
    res: Response
  ) => {
    const query = parseQueryOptions(req);

    const userId = req.user?.id;

    const expenseListResult = await this.#budgetService.find({
      ...query,
      filters: {
        ...query.filters,
        ...(userId ? { userId } : {}),
      },
    });

    res.status(200).json(expenseListResult);
  };

  findOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const budget = await this.#budgetService.findById(id);

    res.status(200).json(budget);
  };

  update = async (
    req: Request<
      { budgetId: string },
      unknown,
      UpdateBudgetRequestDto,
      unknown
    >,
    res: Response
  ) => {
    const budgetId: string = req.params.budgetId;
    log.info(`Updating expense with id ${budgetId}`);

    const updatedBudgetDto: BudgetResponseDto =
      await this.#budgetService.update(budgetId, {
        ...req.body,
        userId: req.user?.id,
      });

    res.status(200).json(updatedBudgetDto);
  };

  delete = async (
    req: Request<{ budgetId: string }, unknown, unknown, unknown>,
    res: Response
  ) => {
    const budgetId: string = req.params.budgetId;
    await this.#budgetService.delete(budgetId);

    res.status(204).send();
  };
}

export const budgetController = new BudgetController(budgetService);
