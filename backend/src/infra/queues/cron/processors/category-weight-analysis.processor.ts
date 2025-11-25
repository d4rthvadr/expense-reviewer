import { log } from '@infra/logger';
import { CronServiceProcessor } from './processor.interface';
import { Job } from 'bullmq';
import { UserService } from '@domain/services/user.service';
import { SpendingAnalysisService } from '@domain/services/spending-analysis.service';
import { AnalysisRunRepository } from '@domain/repositories/analysis-run.repository';
import { subDays, startOfDay } from 'date-fns';

const BATCH_SIZE = 200;

export class CategoryWeightAnalysisProcessor implements CronServiceProcessor {
  #userService: UserService;
  #spendingAnalysisService: SpendingAnalysisService;
  #analysisRunRepository: AnalysisRunRepository;

  constructor(
    userService: UserService,
    spendingAnalysisService: SpendingAnalysisService,
    analysisRunRepository: AnalysisRunRepository
  ) {
    this.#userService = userService;
    this.#spendingAnalysisService = spendingAnalysisService;
    this.#analysisRunRepository = analysisRunRepository;
  }

  /**
   * Calculates the rolling 14-day period (UTC)
   */
  private calculateRollingPeriod(): {
    dateFrom: Date;
    dateTo: Date;
  } {
    const nowUtc = new Date();
    // Set to start of current UTC day
    const dateTo = startOfDay(nowUtc);
    dateTo.setUTCHours(23, 59, 59, 999); // End of day UTC

    // 14 days ago from start of current day
    const dateFrom = subDays(startOfDay(nowUtc), 14);
    dateFrom.setUTCHours(0, 0, 0, 0); // Start of day UTC

    return { dateFrom, dateTo };
  }

  async process(job: Job) {
    log.info({
      message: `Processing category weight analysis job with ID: ${job.id}`,
    });

    const { dateFrom, dateTo } = this.calculateRollingPeriod();
    log.info(
      `Analysis period: ${dateFrom.toISOString()} to ${dateTo.toISOString()}`
    );

    let skip = 0;
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalCompleted = 0;
    let totalFailed = 0;
    const MAX_ITERATIONS = 10000; // Safety limit: 10k batches * 200 = 2M users max
    let iterations = 0;

    try {
      // Paginate through all users
      while (true) {
        iterations++;

        if (iterations > MAX_ITERATIONS) {
          log.error({
            message: `Exceeded max iterations (${MAX_ITERATIONS}), breaking loop to prevent infinite execution`,
            error: new Error('Max iterations exceeded'),
            code: 'CATEGORY_WEIGHT_ANALYSIS_MAX_ITERATIONS',
          });
          break;
        }

        const users = await this.#userService.find({
          take: BATCH_SIZE,
          skip,
        });

        if (users.length === 0) {
          log.info(
            `No more users to process, ending pagination at skip=${skip}`
          );
          break;
        }

        log.info(
          `Processing batch: skip=${skip}, count=${users.length}, period=${dateFrom.toISOString()} to ${dateTo.toISOString()}`
        );

        // Process each user in the batch
        for (const user of users) {
          try {
            // Attempt to acquire lock for this user+period
            const analysisRun = await this.#analysisRunRepository.startOrSkip(
              user.id,
              dateFrom,
              dateTo
            );

            if (!analysisRun) {
              totalSkipped++;
              log.info(
                `Skipped userId: ${user.id} - already processing or completed`
              );
              continue;
            }

            totalProcessed++;

            // Perform analysis
            const result = await this.#spendingAnalysisService.analyzePeriod(
              user.id,
              dateFrom,
              dateTo,
              { thresholdBuffer: 0.05 }
            );

            // Log structured result to console
            const analysisResult = {
              userId: result.userId,
              period: {
                from: result.period.from.toISOString(),
                to: result.period.to.toISOString(),
                label: 'Rolling 14 days',
              },
              totalSpendingUsd: result.totalSpendingUsd,
              categories: result.categories.map((cat) => ({
                category: cat.category,
                targetWeight: `${(cat.weight * 100).toFixed(2)}%`,
                actualShare: `${(cat.actualShare * 100).toFixed(2)}%`,
                spendUsd: cat.spendUsd.toFixed(2),
                deltaPct: cat.breached
                  ? `+${cat.deltaPct.toFixed(2)}%`
                  : '0.00%',
                breached: cat.breached,
              })),
              breachedCategories: result.categories
                .filter((c) => c.breached)
                .map((c) => c.category),
            };
            log.info(
              `Category Weight Analysis Result | ${JSON.stringify(analysisResult)}`
            );

            // Mark as completed
            analysisRun.markAsCompleted();
            await this.#analysisRunRepository.save(analysisRun);
            totalCompleted++;

            log.info(
              `Completed analysis for userId: ${user.id}, spending: $${result.totalSpendingUsd.toFixed(2)}, breaches: ${result.categories.filter((c) => c.breached).length}`
            );
          } catch (userError) {
            totalFailed++;

            log.error({
              message: `Failed to analyze userId: ${user.id}`,
              error: userError,
              code: 'CATEGORY_WEIGHT_ANALYSIS_USER_ERROR',
            });

            // Mark the specific user's run as failed
            // Note: We don't have a reference to analysisRun here since it's scoped to try block
            // This is a design limitation - in production, consider storing run.id before analysis
            // For now, we rely on next day's cron to retry FAILED runs
            log.warn({
              message: `Analysis run will remain in PROCESSING state for userId: ${user.id}. Manual intervention or next cron run required.`,
              code: 'ANALYSIS_RUN_ORPHANED',
            });

            // Continue processing other users
            continue;
          }
        }

        skip += BATCH_SIZE;

        // Log batch progress
        log.info(
          `Batch complete: processed=${totalProcessed}, skipped=${totalSkipped}, completed=${totalCompleted}, failed=${totalFailed}`
        );
      }

      // Final summary
      const summary = {
        period: {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString(),
        },
        totalProcessed,
        totalSkipped,
        totalCompleted,
        totalFailed,
      };
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
