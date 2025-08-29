import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import { log } from '@infra/logger';
import {
  CronServiceProcessor,
  TransactionReviewProcessor,
  NullDefaultProcessor,
  ProcessorNames,
} from './processors';
import { getRedisInstance } from '@infra/db/cache';
import { userService } from '@domain/services/user.service';

const connection = getRedisInstance();

const CRON_NAME = 'transaction-review-cron';

export interface CronJobData {
  processorName: ProcessorNames;
}

type CronServiceProcessorMap = {
  [key in keyof typeof ProcessorNames]: CronServiceProcessor;
};

const cronServiceProcessors: CronServiceProcessorMap = {
  transactionReviewProcessor: new TransactionReviewProcessor(userService),
};

class CronServiceQueue extends Worker {
  #queue: Queue;
  defaultJobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  };

  constructor(queue: Queue) {
    super(
      CRON_NAME,
      async (job: Job) => {
        await this.handleJob(job);
      },
      { connection }
    );

    this.#queue = queue;

    this.on('completed', (job) => {
      log.info(
        `Job ${job.id} has been successfully processed by ${this.constructor.name}!`
      );
    });

    this.on('failed', (job, err) => {
      log.error({
        message: `Job ${job?.id} failed in QueueService with error:`,
        error: err,
        code: '',
      });
    });
  }

  async handleJob(job: Job<CronJobData>) {
    try {
      log.info({
        message: `Processing job in QueueService |  meta: ${JSON.stringify({ jobId: job.id, data: job.data })}`,
      });

      const { processorName } = job.data;

      if (!Object.keys(ProcessorNames).includes(processorName)) {
        log.warn(`No processor found for processorName: ${processorName}`);
        return;
      }
      const processor =
        cronServiceProcessors[processorName as ProcessorNames] ??
        NullDefaultProcessor;

      await processor.process(job);
    } catch (error) {
      log.error({
        message: `Error processing job ${job.id}:`,
        error,
        code: '',
      });
      throw error;
    }
  }

  async addCron(pattern: string, processorName: ProcessorNames) {
    //TODO: Validate pattern format if necessary
    const updatedJobOpts: JobsOptions = {
      ...this.defaultJobOptions,
      repeat: {
        pattern,
      },
    };

    const jobId = `${CRON_NAME}-${processorName}`;
    log.info(
      `Adding cron job with ID: ${jobId} and processor: ${processorName}`
    );

    const cronJobData: CronJobData = {
      processorName,
    };
    await this.#queue.add(jobId, cronJobData, updatedJobOpts);
  }
}

const cronQueue = new Queue(CRON_NAME, {
  connection,
});

const cronServiceQueue = new CronServiceQueue(cronQueue);

export { cronServiceQueue, CRON_NAME };
