import { log } from '@libs/logger';
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
    // Implement the logic for processing the expense review here
    // This could include fetching expenses, validating them, and sending them for review
    // Add your enqueueing job  logic here
    // 1. Fetch expenses from DB that have exceeded 21 days since creation
    // 2. Validate expense and send them for review
    // 3. Create unique jobId for deduplication

    log.info(`Processing expense review job with ID: ${job.id}`);

    await this.#expenseService.processPendingExpensesReview();
  }
}
