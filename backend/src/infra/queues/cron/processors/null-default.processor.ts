import { log } from '@infra/logger';
import { CronServiceProcessor } from './processor.interface';
import { Job } from 'bullmq';

export class NullDefaultProcessor implements CronServiceProcessor {
  async process(job: Job) {
    // This processor does nothing but handle the processors not found case

    log.info({
      message: `Processor not found for : ${job.id} and data: ${JSON.stringify(job.data)}`,
    });
  }
}
