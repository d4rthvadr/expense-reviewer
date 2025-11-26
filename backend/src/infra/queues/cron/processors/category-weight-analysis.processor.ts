import { log } from '@infra/logger';
import { CronServiceProcessor } from './processor.interface';
import { Job } from 'bullmq';
import { subDays, startOfDay } from 'date-fns';
import { CategoryWeightAnalysisOrchestrator } from '@domain/services/category-weight-analysis-orchestrator.service';

/**
 * Minimal queue processor (infrastructure adapter) for scheduled category weight analysis jobs.
 * Delegates complete workflow to CategoryWeightAnalysisOrchestrator service, which handles
 * all business logic, persistence, and email notification queueing.
 *
 * This processor only calculates the period and invokes the orchestrator.
 * Follows hexagonal architecture by keeping infrastructure completely separate from
 * application/domain logic.
 */
export class CategoryWeightAnalysisProcessor implements CronServiceProcessor {
  #orchestrator: CategoryWeightAnalysisOrchestrator;

  constructor(orchestrator: CategoryWeightAnalysisOrchestrator) {
    this.#orchestrator = orchestrator;
  }

  /**
   * Calculates the rolling 14-day analysis period (UTC)
   * @returns Period boundaries for analysis
   * @private
   */
  #calculateRollingPeriod(): {
    dateFrom: Date;
    dateTo: Date;
  } {
    const nowUtc = new Date();
    const dateTo = startOfDay(nowUtc);
    dateTo.setUTCHours(23, 59, 59, 999);

    const dateFrom = subDays(startOfDay(nowUtc), 14);
    dateFrom.setUTCHours(0, 0, 0, 0);

    return { dateFrom, dateTo };
  }

  /**
   * Processes the category weight analysis job.
   * Calculates period and delegates complete workflow to orchestrator.
   *
   * @param job - BullMQ job instance
   */
  async process(job: Job) {
    log.info({
      message: `Processing category weight analysis job with ID: ${job.id}`,
    });

    try {
      // Calculate analysis period
      const { dateFrom, dateTo } = this.#calculateRollingPeriod();
      log.info(
        `Analysis period: ${dateFrom.toISOString()} to ${dateTo.toISOString()}`
      );

      // Delegate complete workflow to orchestrator
      const summary = await this.#orchestrator.runForAllUsers(dateFrom, dateTo);

      // Log final summary
      log.info(
        `Category weight analysis job complete | ${JSON.stringify(summary)}`
      );
    } catch (error) {
      log.error({
        message: `Critical error in category weight analysis job`,
        error,
        code: 'CATEGORY_WEIGHT_ANALYSIS_JOB_ERROR',
      });
      throw error;
    }
  }
}
