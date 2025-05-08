import { Response } from 'express';
import { RequestBodyType } from '../types/request-body.type';
import { ExpenseService } from '../domain/services/expense.service';
import { CreateExpenseRequestDto } from './dtos/request/create-expense-request.dto';
import { log } from '../libs/logger';

export class ExpenseController {
  #expenseService: ExpenseService;
  constructor(expenseService: ExpenseService) {
    this.#expenseService = expenseService;
  }

  create = async (
    req: RequestBodyType<CreateExpenseRequestDto>,
    res: Response
  ) => {
    log.info(`Creating expense with data | meta: ${JSON.stringify(req.body)}`);
    const createdExpenseDto = await this.#expenseService.create(req.body);

    res.status(201).json(createdExpenseDto);
  };
}
