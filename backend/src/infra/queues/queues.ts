import { log } from '@infra/logger';
import { cronServiceQueue, CRON_NAME } from './cron/cron-service-queue';
import './transaction-review.queue';
import './send-email.queue';
import { ProcessorNames } from './cron/processors';

export const startQueuesAndCrons = async () => {
  log.info('Starting queues and cron jobs...');

  // All cron jobs are fire-and-forget with their own error handling
  // Individual job failures won't crash the application

  // Transaction review cron - Weekly Sunday at midnight
  cronServiceQueue
    .addCron('0 0 * * 0', ProcessorNames.transactionReviewProcessor)
    .then(() => {
      log.info(
        `Cron ${CRON_NAME} transaction review job created successfully.`
      );
    })
    .catch((error: Error) => {
      log.error({
        message:
          'Error adding transaction review cron job. Will retry on next schedule.',
        error,
        code: 'CRON_SETUP_ERROR',
      });
    });

  // Category weight analysis cron - Daily at 1:00 AM UTC
  cronServiceQueue
    .addCron('0 1 * * *', ProcessorNames.categoryWeightAnalysisProcessor)
    .then(() => {
      log.info(
        `Cron ${CRON_NAME} category weight analysis job created successfully.`
      );
    })
    .catch((error: Error) => {
      log.error({
        message:
          'Error adding category weight analysis cron job. Will retry on next schedule.',
        error,
        code: 'CRON_SETUP_ERROR',
      });
    });

  // Stale analysis cleanup cron - Every hour
  cronServiceQueue
    .addCron('0 * * * *', ProcessorNames.staleAnalysisCleanupProcessor)
    .then(() => {
      log.info(
        `Cron ${CRON_NAME} stale analysis cleanup job created successfully.`
      );
    })
    .catch((error: Error) => {
      log.error({
        message:
          'Error adding stale analysis cleanup cron job. Will retry on next schedule.',
        error,
        code: 'CRON_SETUP_ERROR',
      });
    });

  log.info('Queue and cron initialization completed (errors logged if any)');
};
