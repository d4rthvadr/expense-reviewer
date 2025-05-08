import { ExpenseRepository } from '../../domain/repositories/expense.repository';
import { log } from '../../libs/logger';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseFactory } from '../../domain/factories/expense.factory';
import { ExpenseResponseDto } from '../../controllers/dtos/response/expense-response.dto';
import { ExpenseModel } from '../../domain/models/expense.model';

export class ExpenseService {
  #expenseRepository: ExpenseRepository;
  constructor(expenseRepository: ExpenseRepository) {
    this.#expenseRepository = expenseRepository;
  }

  async create(data: CreateExpenseDto): Promise<unknown> {
    log.info(`Creating expense with data | meta: ${JSON.stringify(data)}`);

    const expenseModel = ExpenseFactory.createExpense(data);

    const createdExpense: ExpenseModel =
      await this.#expenseRepository.save(expenseModel);

    log.info(`Expense created | meta: ${JSON.stringify(createdExpense)}`);
    return this.#toExpenseCreatedDto(createdExpense);
  }

  #toExpenseCreatedDto(data: ExpenseModel): ExpenseResponseDto {
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
