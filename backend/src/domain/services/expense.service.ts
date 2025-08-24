import { ExpenseRepository } from '@domain/repositories/expense.repository';
import { log } from '@infra/logger';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseFactory } from '@domain/factories/expense.factory';
import { ExpenseResponseDto } from '../../api/controllers/dtos/response/expense-response.dto';
import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';
import { PaginatedResultDto } from '../../api/controllers/dtos/response/paginated-response.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { QueryParams } from './interfaces/query-params';
import { ExpenseStatus } from '@domain/enum/expense-status.enum';
import {
  ExpenseReviewJobData,
  expenseReviewQueueService,
} from '@infra/queues/expense-review.queue';
import { addDays, startOfMonth } from 'date-fns';
import { budgetService } from '@domain/services/budget.service';
import { buildFindQuery } from './utils';
import {
  CurrencyConversionService,
  currencyConversionService,
} from '@domain/services/currency-conversion.service';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseModel } from '@domain/models/expense.model';

type ExpenseReviewPayload = ExpenseReviewJobData;

const DAYS_PASSED_TO_REVIEW = 3; // Number of days after which expenses should be reviewed

class ExpenseService {
  #expenseRepository: ExpenseRepository;
  #currencyConversionService: CurrencyConversionService;

  constructor(
    expenseRepository: ExpenseRepository,
    currencyConversionService: CurrencyConversionService
  ) {
    this.#expenseRepository = expenseRepository;
    this.#currencyConversionService = currencyConversionService;
  }

  /**
   * Retrieves a paginated list of expenses based on the provided query parameters.
   *
   * @param query - The query parameters used to filter, sort, and paginate the expenses.
   * @returns A promise that resolves to a paginated result containing expense response DTOs.
   */
  async find(
    query: QueryParams
  ): Promise<PaginatedResultDto<ExpenseResponseDto>> {
    // TODO:  build where query
    const { data, total } = await this.#expenseRepository.find(query);

    return {
      data: data.map((expense) => this.#toExpenseDto(expense)),
      limit: query.limit,
      offset: query.offset,
      total,
    };
  }

  /**
   * Retrieves an expense by its unique identifier.
   *
   * @param expenseId - The unique identifier of the expense to retrieve.
   * @returns A promise that resolves to the found {@link ExpenseModel}.
   * @throws {ResourceNotFoundException} If no expense is found with the given ID.
   */
  async findById(expenseId: string): Promise<ExpenseModel> {
    log.info(`Finding expense by id: ${expenseId}`);

    const expense: ExpenseModel | null =
      await this.#expenseRepository.findById(expenseId);
    if (!expense) {
      log.error(`Expense not found with id: ${expenseId}`);
      throw new ResourceNotFoundException(
        `Expense not found with id: ${expenseId}`
      );
    }

    return expense;
  }

  /**
   * Retrieves a list of expenses matching the provided array of expense IDs.
   *
   * @param expenseIds - An array of expense IDs to search for.
   * @returns A promise that resolves to an array of {@link ExpenseModel} instances corresponding to the given IDs.
   *
   * @remarks
   * This method logs the IDs being searched and delegates the actual data retrieval to the expense repository.
   */
  async findByIds(expenseIds: string[]): Promise<ExpenseModel[]> {
    log.info(`Finding expenses by ids: ${expenseIds.join(', ')}`);

    const findQueryData = buildFindQuery({
      limit: expenseIds.length,
      filters: {
        id: {
          in: expenseIds,
        },
      },
    });

    const expenses = await this.#expenseRepository.find(findQueryData);

    return expenses.data;
  }

  /**
   * Retrieves a single expense by its unique identifier.
   *
   * @param expenseId - The unique identifier of the expense to retrieve.
   * @returns A promise that resolves to an `ExpenseResponseDto` representing the found expense.
   * @throws {NotFoundException} If no expense is found with the provided ID.
   */
  async findOne(expenseId: string): Promise<ExpenseResponseDto> {
    const expense: ExpenseModel = await this.findById(expenseId);

    return this.#toExpenseDto(expense);
  }

  /**
   * Creates a new expense record using the provided data.
   *
   * @param data - The data required to create a new expense.
   * @returns A promise that resolves to the created expense as a response DTO.
   *
   * @remarks
   * - Logs the creation process for auditing and debugging purposes.
   * - Utilizes the ExpenseFactory to instantiate the expense model.
   * - Persists the new expense using the expense repository.
   * - Converts the persisted expense model to a response DTO before returning.
   */
  async create(data: CreateExpenseDto): Promise<ExpenseResponseDto> {
    log.info(`Creating expense with data | meta: ${JSON.stringify(data)}`);

    const convertedAmountInUsd =
      await this.#currencyConversionService.convertCurrency(
        data.amount,
        data.currency,
        Currency.USD
      );

    const expenseModel: ExpenseModel = ExpenseFactory.createExpense({
      ...data,
      amountUsd: convertedAmountInUsd.convertedAmount,
    });

    const createdExpense: ExpenseModel =
      await this.#expenseRepository.save(expenseModel);

    log.info(`Expense created | meta: ${JSON.stringify(createdExpense)}`);
    return this.#toExpenseDto(createdExpense);
  }

  /**
   * Updates an existing expense with the provided data.
   *
   * This method retrieves the expense by its ID, checks if its status is `PENDING`,
   * and updates its properties with the values from the `UpdateExpenseDto`.
   * If the expense status is not `PENDING`, an error is thrown.
   * After updating, the expense is saved to the repository and any necessary
   * approval processing is performed.
   *
   * @param expenseId - The unique identifier of the expense to update.
   * @param data - The data to update the expense with.
   * @returns A promise that resolves to the updated expense as an `ExpenseResponseDto`.
   * @throws Error if the expense status is not `PENDING`.
   */
  async update(
    expenseId: string,
    data: UpdateExpenseDto
  ): Promise<ExpenseResponseDto> {
    log.info(`Updating expense with data | meta: ${JSON.stringify(data)}`);

    const expense: ExpenseModel = await this.findById(expenseId);

    const convertedAmountInUsd =
      await this.#currencyConversionService.convertCurrency(
        data.amount,
        data.currency,
        Currency.USD
      );

    expense.name = data.name;
    expense.currency = data.currency;
    expense.amount = data.amount;
    expense.amountUsd = convertedAmountInUsd.convertedAmount;
    expense.category = data.category;
    expense.description = data.description;
    expense.qty = data.qty;
    expense.userId = data.userId;
    expense.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    const updatedExpense: ExpenseModel =
      await this.#expenseRepository.save(expense);

    log.info(`Expense updated | meta: ${JSON.stringify(updatedExpense)}`);
    return this.#toExpenseDto(updatedExpense);
  }

  private async fetchApprovedReviewedExpenses(userId: string) {
    log.info(`Fetching approved and not reviewed expenses`);

    // get today's date
    const today = new Date();

    // get first day of the next month
    // This is used to filter expenses that are approved and unreviewed
    const startOfNextMonth = startOfMonth(
      new Date(today.getFullYear(), today.getMonth() + 1, 1)
    );

    const threshHoldDate = addDays(startOfNextMonth, DAYS_PASSED_TO_REVIEW);
    const findQueryData = buildFindQuery({
      filters: {
        userId,
        createdAt: {
          gte: threshHoldDate,
        },
      },
    });

    const { data: expenses }: { data: ExpenseModel[] } =
      await this.#expenseRepository.find(findQueryData);

    return expenses;
  }

  /**
   * Deletes an expense by its unique identifier.
   *
   * This method logs the deletion process, retrieves the expense to be deleted,
   * performs the deletion using the expense repository, and logs the deleted expense metadata.
   *
   * @param expenseId - The unique identifier of the expense to delete.
   * @returns A promise that resolves when the expense has been deleted.
   * @throws {NotFoundError} If the expense with the given ID does not exist.
   */
  async delete(expenseId: string): Promise<void> {
    log.info(`Deleting expense with id: ${expenseId}`);

    const expense: ExpenseModel = await this.findById(expenseId);

    await this.#expenseRepository.delete(expenseId);

    log.info(`Expense deleted | meta: ${JSON.stringify(expense)}`);
  }

  /**
   * Converts an ExpenseModel instance to an ExpenseResponseDto.
   *
   * @param data - The ExpenseModel object containing expense details.
   * @returns An ExpenseResponseDto object with the mapped expense properties.
   */
  #toExpenseDto(data: ExpenseModel): ExpenseResponseDto {
    const {
      id,
      name,
      amount,
      amountUsd,
      category,
      createdAt,
      currency,
      description,
      qty,
    } = data;
    return {
      id,
      name: name!,
      amount,
      amountUsd,
      category,
      createdAt,
      currency,
      description,
      qty,
      items: [],
    };
  }
}

const expenseService = new ExpenseService(
  new ExpenseRepository(),
  currencyConversionService
);
export { expenseService, ExpenseService };
