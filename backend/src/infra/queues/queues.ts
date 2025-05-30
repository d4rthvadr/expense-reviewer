import { log } from '@libs/logger';
import { cronServiceQueue, CRON_NAME } from './cron/cron-service-queue';
import './expense-review.queue';
import { ProcessorNames } from './cron/processors';

export const startQueuesAndCrons = async () => {
  // crons
  cronServiceQueue
    .addCron('* * * * *', ProcessorNames.expenseReviewProcessor)
    .then(() => {
      log.info(`Cron ${CRON_NAME} job created successfully.`);
    })
    .catch((error: Error) => {
      log.error(
        `Error adding job to the expense review cron queue | meta:  ${JSON.stringify(error)}`
      );
    });

  // queues
};
