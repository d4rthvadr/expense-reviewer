import { log } from '@infra/logger';
import { CronServiceProcessor } from './processor.interface';
import { Job } from 'bullmq';
import { UserService } from '@domain/services/user.service';
import { startOfMonth, endOfMonth } from 'date-fns';
import {
  TransactionReviewJobData,
  transactionReviewQueueService,
} from '@infra/queues/transaction-review.queue';

export class TransactionReviewProcessor implements CronServiceProcessor {
  #userService: UserService;

  constructor(userService: UserService) {
    this.#userService = userService;
  }

  /**
   * Calculates the synchronization period for the current month.
   *
   * @returns An object containing:
   * - `dateFrom`: The start date of the current month (at 00:00:00.000).
   * - `dateTo`: The end date of the current month (at 23:59:59.999).
   *
   * @remarks
   * This method uses the current system date to determine the boundaries of the month.
   * The returned dates are set to the exact start and end times of the respective days.
   */
  private calculateSyncPeriod(): {
    dateFrom: Date;
    dateTo: Date;
  } {
    const nowDate = new Date();

    // Calculate month boundaries
    const dateFrom = startOfMonth(nowDate);
    dateFrom.setHours(0, 0, 0, 0); // Start of day

    const dateTo = endOfMonth(nowDate);
    dateTo.setHours(23, 59, 59, 999); // End of day

    return { dateFrom, dateTo };
  }
  async process(job: Job) {
    log.info({
      message: `Processing transaction review job with ID: ${job.id} and data: ${JSON.stringify(job.data)}`,
    });

    const { dateFrom, dateTo } = this.calculateSyncPeriod();

    try {
      const searchQuery = {
        where: {
          OR: [
            { lastRecurSync: null },
            {
              lastRecurSync: {
                lt: dateFrom,
              },
            },
          ],
        },
      };
      const eligibleUsers = await this.#userService.find(searchQuery);

      log.info(
        `Found: ${eligibleUsers.length} users for transaction review using query: ${JSON.stringify(searchQuery)}`
      );

      const now = new Date();
      now.setHours(23, 59, 59, 999); // Set to end of day

      for (const user of eligibleUsers) {
        const jobData: TransactionReviewJobData = {
          userId: user.id,
          dateFrom,
          dateTo,
          lastRecurSyncDate: user.lastRecurSync,
        };

        log.info(
          `Adding transaction to review queue | meta: ${JSON.stringify(jobData)}`
        );

        await transactionReviewQueueService.addJob(jobData);
        log.info(
          `Job added to transaction review queue for user: ${user.id} | meta: ${JSON.stringify(jobData)}`
        );
      }
    } catch (error) {
      log.error({
        message: `An error occurred while processing transaction review job with ID: ${job.id}`,
        error,
        code: 'TRANSACTION_REVIEW_PROCESSING_ERROR',
      });
      throw error;
    }
  }
}
