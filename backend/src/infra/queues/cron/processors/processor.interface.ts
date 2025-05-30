/* eslint-disable no-unused-vars */
import { Job } from 'bullmq';

export abstract class CronServiceProcessor {
  abstract process(job: Job): Promise<void>;
}
