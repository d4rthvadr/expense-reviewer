import { log } from '@infra/logger';
import { CronServiceProcessor } from './processor.interface';
import { Job } from 'bullmq';
import { UserService } from '@domain/services/user.service';
import {
  ExpenseReviewJobData,
  expenseReviewQueueService,
} from '@infra/queues/expense-review.queue';

export class ExpenseReviewProcessor implements CronServiceProcessor {
  #userService: UserService;

  constructor(userService: UserService) {
    this.#userService = userService;
  }
  async process(job: Job) {
    log.info({
      message: `Processing expense review job with ID: ${job.id} and data: ${JSON.stringify(job.data)}`,
    });

    const daysElapsed = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    daysElapsed.setHours(0, 0, 0, 0);
    try {
      const searchQuery = {
        filter: {
          lastRecurSync: {
            lte: daysElapsed,
          },
        },
      };
      const eligibleUsers = await this.#userService.find(searchQuery);

      log.info(
        `Found: ${eligibleUsers.length} users for expense review using query: ${JSON.stringify(searchQuery)}`
      );

      const now = new Date();
      now.setHours(23, 59, 59, 999); // Set to end of day

      for (const user of eligibleUsers) {
        const jobData: ExpenseReviewJobData = {
          userId: user.id,
          dateFrom: daysElapsed,
          dateTo: now,
          lastRecurSyncDate: user.lastRecurSync,
        };

        log.info(
          `Adding expense to review queue | meta: ${JSON.stringify(jobData)}`
        );

        await expenseReviewQueueService.addJob(jobData);
        log.info(
          `Job added to expense review queue for user: ${user.id} | meta: ${JSON.stringify(jobData)}`
        );
      }
    } catch (error) {
      log.error({
        message: `An error occurred while processing expense review job with ID: ${job.id}`,
        error,
        code: 'EXPENSE_REVIEW_PROCESSING_ERROR',
      });
      throw error;
    }
  }
}
