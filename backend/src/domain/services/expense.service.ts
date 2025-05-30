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

export class ExpenseService {
  #expenseRepository: ExpenseRepository;
  constructor(expenseRepository: ExpenseRepository) {
    this.#expenseRepository = expenseRepository;
  }

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
  async findOne(expenseId: string): Promise<ExpenseResponseDto> {
    const expense: ExpenseModel = await this.findById(expenseId);

    return this.#toExpenseDto(expense);
  }

  async create(data: CreateExpenseDto): Promise<ExpenseResponseDto> {
    log.info(`Creating expense with data | meta: ${JSON.stringify(data)}`);

    const expenseModel = ExpenseFactory.createExpense(data);

    const createdExpense: ExpenseModel =
      await this.#expenseRepository.save(expenseModel);

    log.info(`Expense created | meta: ${JSON.stringify(createdExpense)}`);
    return this.#toExpenseDto(createdExpense);
  }

  async update(
    expenseId: string,
    data: UpdateExpenseDto
  ): Promise<ExpenseResponseDto> {
    log.info(`Updating expense with data | meta: ${JSON.stringify(data)}`);

    const expense: ExpenseModel = await this.findById(expenseId);

    expense.name = data.name;
    expense.type = data.type;
    expense.items = data.items;

    const updatedExpense: ExpenseModel =
      await this.#expenseRepository.save(expense);

    log.info(`Expense updated | meta: ${JSON.stringify(updatedExpense)}`);
    return this.#toExpenseDto(updatedExpense);
  }

  async delete(expenseId: string): Promise<void> {
    log.info(`Deleting expense with id: ${expenseId}`);

    const expense: ExpenseModel = await this.findById(expenseId);

    await this.#expenseRepository.delete(expenseId);

    log.info(`Expense deleted | meta: ${JSON.stringify(expense)}`);
  }

  #toExpenseDto(data: ExpenseModel): ExpenseResponseDto {
    const { id, name, type, userId, createdAt, updatedAt, items } = data;
    return {
      id,
      name,
      type,
      userId,
      createdAt,
      updatedAt,
      items,
    };
  }
}
