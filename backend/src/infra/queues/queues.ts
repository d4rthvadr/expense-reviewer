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

  cronServiceQueue
    .addCron('0 1 * * *', ProcessorNames.categoryWeightAnalysisProcessor) // Daily at 1:00 AM UTC
    .then(() => {
      log.info(
        `Cron ${CRON_NAME} category weight analysis job created successfully.`
      );
    })
    .catch((error: Error) => {
      log.error(
        `Error adding job to the category weight analysis cron queue | meta:  ${JSON.stringify(error)}`
      );
    });

  cronServiceQueue
    .addCron('0 * * * *', ProcessorNames.staleAnalysisCleanupProcessor) // Every hour
    .then(() => {
      log.info(
        `Cron ${CRON_NAME} stale analysis cleanup job created successfully.`
      );
    })
    .catch((error: Error) => {
      log.error(
        `Error adding job to the stale analysis cleanup cron queue | meta:  ${JSON.stringify(error)}`
      );
    });
  // queues
};
