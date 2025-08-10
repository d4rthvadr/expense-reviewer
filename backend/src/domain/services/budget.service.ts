import { BudgetResponseDto } from '@api/controllers/dtos/response/budget-response.dto';
import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';
import { BudgetFactory } from '@domain/factories/budget.factory';
import { BudgetModel } from '@domain/models/budget.model';
import {
  budgetRepository,
  BudgetRepository,
} from '@domain/repositories/budget.repository';
import { log } from '@infra/logger';
import { CreateBudgetDto } from './dtos/create-budget.dto';
import { QueryParams } from './interfaces/query-params';
import { PaginatedResultDto } from '@api/controllers/dtos/response/paginated-response.dto';
import { buildFindQuery } from './utils';
import {
  currencyConversionService,
  CurrencyConversionService,
} from './currency-conversion.service';
import { Currency } from '@domain/enum/currency.enum';

export class BudgetService {
  #budgetRepository: BudgetRepository;
  #currencyConversionService: CurrencyConversionService;

  constructor(
    budgetRepository: BudgetRepository,
    currencyConversionService: CurrencyConversionService
  ) {
    this.#budgetRepository = budgetRepository;
    this.#currencyConversionService = currencyConversionService;
  }

  async find(
    query: QueryParams
  ): Promise<PaginatedResultDto<BudgetResponseDto>> {
    const { data, total } = await this.#budgetRepository.find(query);

    return {
      data: data.map((budget) => this.#toBudgetDto(budget)),
      limit: query.limit,
      offset: query.offset,
      total,
    };
  }

  async findById(budgetId: string): Promise<BudgetResponseDto> {
    log.info(`Finding budget by id: ${budgetId}`);

    const budget: BudgetModel = await this.findByBudgetById(budgetId);
    return this.#toBudgetDto(budget);
  }

  async findByBudgetById(budgetId: string): Promise<BudgetModel> {
    const budget: BudgetModel | null =
      await this.#budgetRepository.findById(budgetId);
    this.validateBudgetFound(budget, budgetId);

    return budget;
  }

  async create(data: CreateBudgetDto): Promise<BudgetResponseDto> {
    log.info(`Creating budget with data: | meta: ${JSON.stringify({ data })}`);
    const conversionResult =
      await this.#currencyConversionService.convertCurrency(
        data.amount,
        data.currency || Currency.USD,
        Currency.USD
      );

    const budgetModel = BudgetFactory.createBudget({
      ...data,
      amountUsd: conversionResult.convertedAmount,
    });

    const budget = await this.#budgetRepository.save(budgetModel);

    return this.#toBudgetDto(budget);
  }

  async update(
    budgetId: string,
    data: Partial<CreateBudgetDto>
  ): Promise<BudgetResponseDto> {
    log.info(
      `Updating budget with id: ${budgetId} | data: ${JSON.stringify(data)}`
    );

    const budget: BudgetModel = await this.findByBudgetById(budgetId);

    budget.name = data.name;
    budget.description = data.description;
    budget.currency = data.currency;
    budget.category = data.category;
    budget.amount = data.amount;
    budget.isRecurring = data.isRecurring ?? budget.isRecurring;
    budget.recurringTemplateId =
      data.recurringTemplateId ?? budget.recurringTemplateId;

    const updatedBudget = await this.#budgetRepository.save(budget);

    return this.#toBudgetDto(updatedBudget);
  }

  async getUserBudgets(userId?: string) {
    log.info(`Fetching user budgets for userId: ${userId}`);

    const budgetFindQuery = buildFindQuery({
      filters: {
        // userId, TODO: Uncomment when userId is available in budget model
      },
    });

    return (await this.find(budgetFindQuery)).data;
  }

  async delete(budgetId: string): Promise<void> {
    log.info(`Deleting budget with id: ${budgetId}`);
    const budget: BudgetModel = await this.findByBudgetById(budgetId);
    await this.#budgetRepository.delete(budget.id);
  }

  validateBudgetFound(
    budget: BudgetModel | null,
    budgetId: string
  ): asserts budget is BudgetModel {
    if (!budget) {
      log.error(`Budget not found with id: ${budgetId}`);
      throw new ResourceNotFoundException(
        `Budget not found with id: ${budgetId}`
      );
    }
  }
  #toBudgetDto(data: BudgetModel): BudgetResponseDto {
    const {
      id,
      name,
      description,
      category,
      currency,
      amount,
      isRecurring,
      recurringTemplateId,
      createdAt,
      updatedAt,
    }: BudgetModel = data;
    return {
      id,
      name,
      amount,
      category,
      currency,
      description,
      isRecurring,
      recurringTemplateId,
      createdAt,
      updatedAt,
    };
  }
}

export const budgetService = new BudgetService(
  budgetRepository,
  currencyConversionService
);
