import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import { log } from '@infra/logger';
import { getRedisInstance } from '@infra/db/cache';
import { agentService, AgentService } from '@domain/services/agent.service';
import { Currency } from '../../../generated/prisma';
import { buildPrompt } from '@infra/language-models/prompt-builder';
import { expenseService } from '@domain/services/expense.service';
import { ExpenseModel } from '@domain/models/expense.model';

const connection = getRedisInstance();

const QUEUE_NAME = 'expense-review-queue';

export interface BudgetPerCategory {
  category: string;
  currency?: Currency;
  budget: number;
}

export type ExpenseReviewJobData = {
  expenseId: string;
  userId: string | undefined;
  budgetPerCategory?: BudgetPerCategory[];
};

class ExpenseReviewQueueService extends Worker {
  #queue: Queue;
  #agentService: AgentService;

  defaultJobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  };
  constructor(queue: Queue, agentService: AgentService) {
    super(
      QUEUE_NAME,
      async (job: Job) => {
        await this.handleJob(job);
      },
      { connection }
    );

    this.#queue = queue;
    this.#agentService = agentService;

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

      const { expenseId, budgetPerCategory = [] } = job.data;

      // const expense = await expenseService.findById(expenseId);

      // const { items: expenseItems } = expense;

      const expenses: ExpenseModel[] = [];

      const promptText = buildPrompt.reviewUserExpense(
        expenses,
        budgetPerCategory
      );

      const review = await this.#agentService.extractTableData(promptText);

      await expenseService.updatePendingExpensesReview(expenseId, review);
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

    const jobName = `expense-review-${data.expenseId}-${data.userId}`;
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
  agentService
);

export { expenseReviewQueueService, QUEUE_NAME };
