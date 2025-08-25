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
import { BudgetFindFilters } from './interfaces/budget-filters';
import { paginateDataResult } from '@api/controllers/utils/paginate-response';

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
    query: QueryParams<BudgetFindFilters>,
    userId: string
  ): Promise<PaginatedResultDto<BudgetResponseDto>> {
    const { data, total } = await this.#budgetRepository.find(query, userId);

    return paginateDataResult(
      data.map((budget) => this.#toBudgetDto(budget)),
      total,
      query.limit,
      query.offset
    );
  }

  async findById(budgetId: string, userId: string): Promise<BudgetResponseDto> {
    log.info(`Finding budget by id: ${budgetId} for userId: ${userId}`);

    const budget: BudgetModel = await this.findByBudgetById(budgetId, userId);
    return this.#toBudgetDto(budget);
  }

  async findByBudgetById(
    budgetId: string,
    userId: string
  ): Promise<BudgetModel> {
    const budget: BudgetModel | null = await this.#budgetRepository.findById(
      budgetId,
      userId
    );
    this.validateBudgetFound(budget, budgetId);

    return budget;
  }

  /**
   * Creates a new budget entry.
   *
   * This method logs the creation request, converts the provided amount to USD if necessary,
   * constructs a new budget model, saves it to the repository, and returns the created budget as a DTO.
   *
   * @param data - The data required to create a new budget, including amount and currency.
   * @returns A promise that resolves to the created budget as a BudgetResponseDto.
   */
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
    data: CreateBudgetDto
  ): Promise<BudgetResponseDto> {
    log.info(
      `Updating budget with id: ${budgetId} | data: ${JSON.stringify(data)}`
    );

    const budget: BudgetModel = await this.findByBudgetById(
      budgetId,
      data.userId
    );

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

  async delete(budgetId: string, userId: string): Promise<void> {
    log.info(`Deleting budget with id: ${budgetId} for userId: ${userId}`);
    const budget: BudgetModel = await this.findByBudgetById(budgetId, userId);
    await this.#budgetRepository.delete(budget.id, userId);
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
