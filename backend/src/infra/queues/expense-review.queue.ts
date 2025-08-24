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
  expenseReviewService,
  ExpenseReviewService,
} from '@domain/services/expense-review.service';
import { userService } from '@domain/services/user.service';

const connection = getRedisInstance();

const QUEUE_NAME = 'expense-review-queue';

export type ExpenseReviewJobData = {
  dateTo: Date;
  dateFrom: Date;
  userId: string;
  lastRecurSyncDate?: Date;
};

class ExpenseReviewQueueService extends Worker {
  #queue: Queue;
  #agentService: AgentService;
  #analyticsService: AnalyticsService;
  #expenseReviewService: ExpenseReviewService;

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
    expenseReviewService: ExpenseReviewService,
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
    this.#expenseReviewService = expenseReviewService;

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

  async handleJob(job: Job<ExpenseReviewJobData>) {
    try {
      log.info({
        message: `Processing job in ${this.constructor.name} |  meta: ${JSON.stringify({ jobId: job.id, data: job.data })}`,
      });

      const { userId, dateFrom, dateTo, lastRecurSyncDate } = job.data;

      const budgetWithExpenses =
        await this.#analyticsService.getBudgetVsExpenses(
          dateFrom,
          dateTo,
          userId
        );
      log.info(
        `Processing expense review for user: ${userId} with budget data: ${JSON.stringify(budgetWithExpenses.length)}`
      );

      const promptText = buildPrompt.reviewUserExpense(budgetWithExpenses);

      const review = await this.#agentService.generateAIResponse(promptText);

      const savedReview = await this.#expenseReviewService.createReview(
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

  async addJob(data: ExpenseReviewJobData) {
    log.info(`Adding job to queue with data: ${JSON.stringify(data)}`);

    const jobName = `expense-review-${data.userId}`;
    await this.#queue.add(jobName, data, this.defaultJobOptions);
  }
}

// Create a new BullMQ queue
// This queue will be used to process expense review jobs
const expenseReviewQueue = new Queue(QUEUE_NAME, {
  connection,
});

// Create a new instance of QueueService
const expenseReviewQueueService = new ExpenseReviewQueueService(
  expenseReviewQueue,
  agentService,
  expenseReviewService,
  analyticsService
);

export { expenseReviewQueueService, QUEUE_NAME };
