import { log } from '@infra/logger';
import { CronServiceProcessor } from './processor.interface';
import { Job } from 'bullmq';
import { ExpenseService } from '@domain/services/expense.service';

export class ExpenseReviewProcessor implements CronServiceProcessor {
  #expenseService: ExpenseService;
  constructor(expenseService: ExpenseService) {
    this.#expenseService = expenseService;
  }
  async process(job: Job) {
    log.info({
      message: `Processing expense review job with ID: ${job.id} and data: ${JSON.stringify(job.data)}`,
    });

    log.info(`Processing expense review job with ID: ${job.id}`);

    await this.#expenseService.processPendingExpensesReview();
  }
}
