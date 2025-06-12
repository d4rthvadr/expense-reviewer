import { ExpenseRepository } from '@domain/repositories/expense.repository';
import { log } from '@libs/logger';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseFactory } from '@domain/factories/expense.factory';
import { ExpenseResponseDto } from '../../controllers/dtos/response/expense-response.dto';
import { ExpenseModel } from '@domain/models/expense.model';
import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';
import { PaginatedResultDto } from '../../controllers/dtos/response/paginated-response.dto';
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

type ExpenseReviewPayload = ExpenseReviewJobData;

const DAYS_PASSED_TO_REVIEW = 3; // Number of days after which expenses should be reviewed

class ExpenseService {
  #expenseRepository: ExpenseRepository;
  constructor(expenseRepository: ExpenseRepository) {
    this.#expenseRepository = expenseRepository;
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

    const expenseModel = ExpenseFactory.createExpense(data);

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

    if (expense.status !== ExpenseStatus.PENDING) {
      log.error(`Expense status is not PENDING: ${expense.status}`);
      // TODO: Handle this case appropriately, e.g., throw an error or return a specific response
      // throw new Error('Expense status is not PENDING');
    }

    expense.name = data.name;
    expense.currency = data.currency;
    expense.review = data.review;
    expense.type = data.type;
    expense.status = data.status;
    expense.items = data.items;

    const updatedExpense: ExpenseModel =
      await this.#expenseRepository.save(expense);

    await this.#processExpenseApproval({
      expenseId,
      status: updatedExpense.status,
      userId: expense.userId,
    });

    log.info(`Expense updated | meta: ${JSON.stringify(updatedExpense)}`);
    return this.#toExpenseDto(updatedExpense);
  }

  /**
   * Processes the approval of an expense by updating its status and, if approved,
   * logs the approval and adds the expense to the review queue.
   *
   * @param expenseId - The unique identifier of the expense to process.
   * @param status - The new status to set for the expense.
   * @param userId - The identifier of the user performing the approval, or undefined if not available.
   * @returns A promise that resolves when the processing is complete.
   */
  async #processExpenseApproval(
    data: ExpenseReviewPayload & { status: ExpenseStatus }
  ) {
    const { expenseId, status } = data;
    if (status !== ExpenseStatus.APPROVED) {
      log.info(
        `Expense with id ${expenseId} not approved with status: ${status}`
      );
      return;
    }

    const budgets = (
      (await budgetService.getUserBudgets(data.userId)) || []
    ).map((budget) => ({
      category: budget.category,
      budget: budget.amount,
      currency: budget.currency,
    }));
    await this.pushPendingExpenseToReviewQueue({
      ...data,
      budgetPerCategory: budgets,
    });
  }

  async fetchApprovedReviewedExpenses() {
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
        status: ExpenseStatus.PENDING,
        review: null, // Only fetch expenses that are not reviewed
        createdAt: {
          lte: threshHoldDate,
        },
      },
    });

    const { data: expenses }: { data: ExpenseModel[] } =
      await this.#expenseRepository.find(findQueryData);

    return expenses;
  }

  /**
   * Adds a pending expense to the review queue for further processing.
   *
   * This method constructs a job containing the expense ID and user ID,
   * logs the action, and enqueues the job using the expense review queue service.
   *
   * @param expense - The expense model instance to be pushed to the review queue.
   * @returns A promise that resolves when the job has been successfully added to the queue.
   */
  async pushPendingExpenseToReviewQueue({
    expenseId,
    userId,
    budgetPerCategory,
  }: ExpenseReviewPayload) {
    const jobData: ExpenseReviewJobData = {
      expenseId,
      userId,
      budgetPerCategory,
    };

    log.info(
      `Adding expense to review queue | meta: ${JSON.stringify(jobData)}`
    );

    await expenseReviewQueueService.addJob(jobData);
  }
  async processPendingExpensesReview() {
    try {
      log.info(`Processing pending expenses review`);
      const expenses: ExpenseModel[] =
        await this.fetchApprovedReviewedExpenses();

      for (const expense of expenses) {
        await this.pushPendingExpenseToReviewQueue({
          expenseId: expense.id,
          userId: expense.userId,
        });
      }
    } catch (error: Error | any) {
      log.error(`Error processing pending expenses review: ${error.message}`);
      throw error;
    }
  }

  async updatePendingExpensesReview(
    expenseId: string,
    review: string
  ): Promise<void> {
    log.info(`Updating pending expense review for id: ${expenseId}`);

    const expense: ExpenseModel = await this.findById(expenseId);

    if (expense.status !== ExpenseStatus.PENDING) {
      log.warn(`Expense status is not PENDING: ${expense.status}`);
      return;
    }

    expense.review = review;

    const updatedExpense: ExpenseModel =
      await this.#expenseRepository.save(expense);

    log.info(
      `Pending expense review updated | meta: ${JSON.stringify(updatedExpense)}`
    );
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
      type,
      userId,
      status,
      review,
      createdAt,
      currency,
      updatedAt,
      items,
    } = data;
    return {
      id,
      name,
      type,
      userId,
      status,
      review,
      currency,
      createdAt,
      updatedAt,
      items,
    };
  }
}

const expenseService = new ExpenseService(new ExpenseRepository());
export { expenseService, ExpenseService };
