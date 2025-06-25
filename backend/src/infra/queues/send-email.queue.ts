import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import { log } from '@infra/logger';
import { getRedisInstance } from '@infra/db/cache';
import { TemplateNames, TemplateWithPayloadArgs } from '@infra/email/types';
import { emailService } from '@infra/email/email.service';

const connection = getRedisInstance();

const QUEUE_NAME = 'send-email-queue';

export type SendEmailJobData = {
  templateId: TemplateNames;
  userEmail: string;
  data: TemplateWithPayloadArgs<TemplateNames>;
};

class SendEmailQueueService extends Worker {
  #queue: Queue;

  defaultJobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    priority: 1,
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
        `Job ${job?.name}:${job?.id} has been successfully processed by ${this.constructor.name}!`
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

  async handleJob(job: Job<SendEmailJobData>) {
    try {
      log.info({
        message: `Processing job in ${this.constructor.name} |  meta: ${JSON.stringify({ jobId: job.id, data: job.data })}`,
      });

      const { templateId, userEmail, data } = job.data;

      await emailService.sendEmail({
        subject: `Notification for ${templateId}`, // TODO: Customize subject based on template
        to: userEmail,
        templateName: templateId,
        templateArgs: data,
      });
    } catch (error) {
      log.error({
        message: `Error processing job ${job.id}:`,
        error,
        code: '',
      });
      throw error;
    }
  }

  async addJob(data: SendEmailJobData) {
    log.info(`Adding job to queue with data: ${JSON.stringify(data)}`);

    const jobName = `send-email-${data.templateId}-${data.userEmail}`;
    await this.#queue.add(jobName, data, this.defaultJobOptions);
  }
}

// Create a new BullMQ queue
// This queue will be used to process send email jobs
const sendEmailQueue = new Queue(QUEUE_NAME, {
  connection,
});

// Create a new instance of QueueService
const sendEmailQueueService = new SendEmailQueueService(sendEmailQueue);

export { sendEmailQueueService, QUEUE_NAME };
