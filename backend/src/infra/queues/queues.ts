import { log } from '@infra/logger';
import { cronServiceQueue, CRON_NAME } from './cron/cron-service-queue';
import './transaction-review.queue';
import { ProcessorNames } from './cron/processors';

export const startQueuesAndCrons = async () => {
  // crons
  cronServiceQueue
    .addCron('0 0 * * 0', ProcessorNames.transactionReviewProcessor) // Every Sunday at midnight
    .then(() => {
      log.info(`Cron ${CRON_NAME} job created successfully.`);
    })
    .catch((error: Error) => {
      log.error(
        `Error adding job to the transaction review cron queue | meta:  ${JSON.stringify(error)}`
      );
    });
  // queues
};
