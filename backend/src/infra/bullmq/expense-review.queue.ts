import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import { log } from '../../libs/logger';
import { getRedisInstance } from '../../db/ioredis-singleton';

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
      console.log(
        `Job ${job.id} has been successfully processed by QueueService!`
      );
    });

    this.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed in QueueService with error:`, err);
    });
  }

  async handleJob(job: Job) {
    // Implement your job-specific logic here
    console.log('Handling job:', job.id, job.data);

    log.info(
      `Processing job with ID: ${job.id} and data: ${JSON.stringify(job.data)}`
    );

    try {
      console.log('Processing job in QueueService:', job.id, job.data);
      // Add your job processing logic here
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
    await this.#queue.add('my-job', data, updatedJobOpts);
  }
}

// Create a new BullMQ queue
// This queue will be used to process expense review jobs
const expenseReviewQueue = new Queue(QUEUE_NAME, {
  connection,
});

// Create a new instance of QueueService
export const expenseReviewQueueService = new ExpenseReviewQueueService(
  expenseReviewQueue
);
