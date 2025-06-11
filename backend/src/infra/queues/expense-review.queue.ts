import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import { log } from '@libs/logger';
import { getRedisInstance } from '@infra/db/ioredis-singleton';

const connection = getRedisInstance();

const QUEUE_NAME = 'expense-review-queue';

class ExpenseReviewQueueService extends Worker {
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
      QUEUE_NAME,
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

  async handleJob(job: Job) {
    // Implement your job-specific logic here

    log.info(
      `Processing job with ID: ${job.id} and data: ${JSON.stringify(job.data)}`
    );

    try {
      log.info({
        message: `Processing job in ${this.constructor.name} |  meta: ${JSON.stringify({ jobId: job.id, data: job.data })}`,
      });

      // TODO: call LLM to review expense.
    } catch (error) {
      log.error({
        message: `Error processing job ${job.id}:`,
        error,
        code: '',
      });
      throw error;
    }
  }

  async addJob(data: any, jobOpts?: JobsOptions) {
    log.info(`Adding job to queue with data: ${JSON.stringify(data)}`);

    const updatedJobOpts = {
      ...this.defaultJobOptions,
      ...jobOpts,
    };
    // TODO: create a unique jobId for deduplication
    await this.#queue.add('my-job', data, updatedJobOpts);
  }
}

// Create a new BullMQ queue
// This queue will be used to process expense review jobs
const expenseReviewQueue = new Queue(QUEUE_NAME, {
  connection,
});

// Create a new instance of QueueService
const expenseReviewQueueService = new ExpenseReviewQueueService(
  expenseReviewQueue
);

export { expenseReviewQueueService, QUEUE_NAME };
