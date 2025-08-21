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

  // async processOld(job: Job) {
  //   log.info({
  //     message: `Processing expense review job with ID: ${job.id} and data: ${JSON.stringify(job.data)}`,
  //   });

  //   //await this.#expenseService.processPendingExpensesReview(job.data.userId);

  //   // 1. lets get user's with last lastRecurSync exceeding 30 days for the time being
  //   // or 2. We get the specific month of the lastRecurSync of us
  //   // TODO: maybe we can use a different column.
  //   // FOr now this will be used to trigger expense review for all users

  //   const daysElapsed = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  //   try {
  //     const eligibleUsers = await this.#userService.find({
  //       filter: {
  //         lastRecurSync: {
  //           lte: daysElapsed,
  //         },
  //       },
  //     });

  //     log.info(`Found ${eligibleUsers.length} users for expense review.`);

  //     daysElapsed.setHours(0, 0, 0, 0);

  //     const now = new Date();
  //     now.setHours(23, 59, 59, 999); // Set to end of day

  //     for (const user of eligibleUsers) {
  //       const budgetWithExpenses =
  //         await this.#analyticsService.getBudgetVsExpenses(
  //           daysElapsed,
  //           now,
  //           user.id
  //         );
  //       log.info(
  //         `Processing expense review for user: ${user.id} with budget data: ${JSON.stringify(budgetWithExpenses)}`
  //       );
  //     }
  //   } catch (error) {
  //     log.error({
  //       message: `An error occurred while processing expense review job with ID: ${job.id}`,
  //       error,
  //       code: 'EXPENSE_REVIEW_PROCESSING_ERROR',
  //     });
  //     throw error;
  //   }
  // }
}
