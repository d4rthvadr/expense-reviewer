import { ExpenseService } from '../domain/services/expense.service';
import { Request, Response } from 'express';

export class ExpenseController {
  #expenseService: ExpenseService;
  constructor(expenseService: ExpenseService) {
    this.#expenseService = expenseService;
    // Bind the method to the instance
    this.create = this.create.bind(this);
  }

  async create(req: Request, res: Response) {
    const { text } = req.body;
  }
}
