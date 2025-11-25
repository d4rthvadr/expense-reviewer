import { log } from '@infra/logger';
import { CronServiceProcessor } from './processor.interface';
import { Job } from 'bullmq';
import { AnalysisRunService } from '@domain/services/analysis-run.service';
import { AnalysisRunRepository } from '@domain/repositories/analysis-run.repository';
import { subHours } from 'date-fns';
import { analysisConfig } from '@config/analysis.config';

export class StaleAnalysisCleanupProcessor implements CronServiceProcessor {
  #analysisRunService: AnalysisRunService;
  #analysisRunRepository: AnalysisRunRepository;

  constructor(
    analysisRunService: AnalysisRunService,
    analysisRunRepository: AnalysisRunRepository
  ) {
    this.#analysisRunService = analysisRunService;
    this.#analysisRunRepository = analysisRunRepository;
  }

  async process(job: Job) {
    log.info({
      message: `Processing stale analysis cleanup job with ID: ${job.id}`,
    });

    const staleThreshold = subHours(
      new Date(),
      analysisConfig.STALE_THRESHOLD_HOURS
    );

    log.info(
      `Looking for stale analysis runs older than: ${staleThreshold.toISOString()}`
    );

    try {
      const staleRuns =
        await this.#analysisRunService.findStale(staleThreshold);

      if (staleRuns.length === 0) {
        log.info('No stale analysis runs found');
        return;
      }

      log.info(`Found ${staleRuns.length} stale analysis runs to clean up`);

      let markedCount = 0;
      let failedCount = 0;

      for (const run of staleRuns) {
        try {
          run.markAsFailed(
            `Processing timeout - marked as stale after ${analysisConfig.STALE_THRESHOLD_HOURS} hours`
          );
          await this.#analysisRunRepository.save(run);
          markedCount++;

          log.info(
            `Marked stale run as failed: ${run.id} for period ${run.periodStart.toISOString()}`
          );
        } catch (error) {
          failedCount++;
          log.error({
            message: `Failed to mark stale run as failed: ${run.id}`,
            error,
            code: 'STALE_ANALYSIS_CLEANUP_ERROR',
          });
        }
      }

      log.info(
        `Stale analysis cleanup complete | total: ${staleRuns.length}, marked: ${markedCount}, failed: ${failedCount}`
      );
    } catch (error) {
      log.error({
        message: 'Critical error in stale analysis cleanup job',
        error,
        code: 'STALE_ANALYSIS_CLEANUP_JOB_ERROR',
      });
      throw error;
    }
  }
}
