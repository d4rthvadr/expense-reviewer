import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import { log } from '@infra/logger';
import { getRedisInstance } from '@infra/db/cache';
import { agentService, AgentService } from '@domain/services/agent.service';
import { buildPrompt } from '@infra/language-models/prompt-builder';
import {
  AnalyticsService,
  analyticsService,
} from '@domain/services/analytics.service';
import {
  transactionReviewService,
  TransactionReviewService,
} from '@domain/services/transaction-review.service';
import { userService } from '@domain/services/user.service';

const connection = getRedisInstance();

const QUEUE_NAME = 'transaction-review-queue';

export type TransactionReviewJobData = {
  dateTo: Date;
  dateFrom: Date;
  userId: string;
  lastRecurSyncDate?: Date;
};

class TransactionReviewQueueService extends Worker {
  #queue: Queue;
  #agentService: AgentService;
  #analyticsService: AnalyticsService;
  #transactionReviewService: TransactionReviewService;

  defaultJobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  };
  constructor(
    queue: Queue,
    agentService: AgentService,
    transactionReviewService: TransactionReviewService,
    analyticsService: AnalyticsService
  ) {
    super(
      QUEUE_NAME,
      async (job: Job) => {
        await this.handleJob(job);
      },
      { connection }
    );

    this.#queue = queue;
    this.#agentService = agentService;
    this.#analyticsService = analyticsService;
    this.#transactionReviewService = transactionReviewService;

    this.on('completed', (job) => {
      log.info(
        `Job ${job.name}:${job.id} has been successfully processed by ${this.constructor.name}.`
      );
    });

    this.on('failed', (job, err) => {
      log.error({
        message: `Job ${job?.name}:${job?.id} failed in ${this.constructor.name} with error.`,
        error: err,
        code: '',
      });
    });
  }

  async handleJob(job: Job<TransactionReviewJobData>) {
    try {
      log.info({
        message: `Processing job in ${this.constructor.name} |  meta: ${JSON.stringify({ jobId: job.id, data: job.data })}`,
      });

      const { userId, dateFrom, dateTo, lastRecurSyncDate } = job.data;

      const budgetWithTransactions =
        await this.#analyticsService.getBudgetVsTransactions(
          dateFrom,
          dateTo,
          userId
        );
      log.info(
        `Processing transaction review for user: ${userId} with budget data: ${JSON.stringify(budgetWithTransactions.length)}`
      );

      const promptText = buildPrompt.reviewUserTransaction(
        budgetWithTransactions
      );

      const review = await this.#agentService.generateAIResponse(promptText);

      const savedReview = await this.#transactionReviewService.createReview(
        review,
        userId
      );

      //update user's lastRecurSync date
      await userService.updateUserLastRecurSync(userId, lastRecurSyncDate);

      log.info(
        `Expense review created successfully for user: ${userId} with review ID: ${savedReview.id}`
      );
    } catch (error) {
      log.error({
        message: `Error processing job ${job.name}:${job.id}`,
        error,
        code: '',
      });
      throw error;
    }
  }

  async addJob(data: TransactionReviewJobData) {
    log.info(`Adding job to queue with data: ${JSON.stringify(data)}`);

    const jobName = `transaction-review-${data.userId}`;
    await this.#queue.add(jobName, data, this.defaultJobOptions);
  }
}

// Create a new BullMQ queue
// This queue will be used to process transaction review jobs
const transactionReviewQueue = new Queue(QUEUE_NAME, {
  connection,
});

// Create a new instance of QueueService
const transactionReviewQueueService = new TransactionReviewQueueService(
  transactionReviewQueue,
  agentService,
  transactionReviewService,
  analyticsService
);

export { transactionReviewQueueService, QUEUE_NAME };
