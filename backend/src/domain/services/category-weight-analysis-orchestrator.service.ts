import { log } from '@infra/logger';
import { UserService } from './user.service';
import { SpendingAnalysisService } from './spending-analysis.service';
import { ReviewGenerationService } from './review-generation.service';
import { TransactionReviewService } from './transaction-review.service';
import { AnalysisRunRepository } from '@domain/repositories/analysis-run.repository';
import { analysisConfig } from '@config/analysis.config';
import type { sendEmailQueueService } from '@infra/queues/send-email.queue';
import { TemplateNames } from '@infra/email/types';

/**
 * Result summary for a category weight analysis job execution
 */
export type AnalysisJobResult = {
  period: {
    from: string;
    to: string;
  };
  totalProcessed: number;
  totalSkipped: number;
  totalCompleted: number;
  totalFailed: number;
};

/**
 * Generated review data for a single user
 */
export type UserReviewData = {
  userId: string;
  userEmail: string;
  reviewText: string;
};

/**
 * Category data from spending analysis result
 */
type CategoryResult = {
  category: string;
  weight: number;
  actualShare: number;
  spendUsd: number;
  deltaPct: number;
  breached: boolean;
};

/**
 * Spending analysis result structure
 */
type AnalysisResult = {
  userId: string;
  period: {
    from: Date;
    to: Date;
  };
  totalSpendingUsd: number;
  categories: CategoryResult[];
};

/**
 * Orchestrates the category weight analysis workflow for all users.
 * Handles user pagination, lock acquisition, analysis execution, review generation,
 * and batch processing with proper error recovery.
 *
 * This service represents the application layer use case, keeping infrastructure
 * concerns (queues, cron jobs) separate from business logic orchestration.
 */
export class CategoryWeightAnalysisOrchestrator {
  #userService: UserService;
  #spendingAnalysisService: SpendingAnalysisService;
  #reviewGenerationService: ReviewGenerationService;
  #transactionReviewService: TransactionReviewService;
  #analysisRunRepository: AnalysisRunRepository;
  #sendEmailQueueService: typeof sendEmailQueueService;

  constructor(
    userService: UserService,
    spendingAnalysisService: SpendingAnalysisService,
    reviewGenerationService: ReviewGenerationService,
    transactionReviewService: TransactionReviewService,
    analysisRunRepository: AnalysisRunRepository,
    emailQueueService: typeof sendEmailQueueService
  ) {
    this.#userService = userService;
    this.#spendingAnalysisService = spendingAnalysisService;
    this.#reviewGenerationService = reviewGenerationService;
    this.#transactionReviewService = transactionReviewService;
    this.#analysisRunRepository = analysisRunRepository;
    this.#sendEmailQueueService = emailQueueService;
  }

  /**
   * Executes category weight analysis for all users within the specified period.
   * Processes users in batches, persists reviews to database, and enqueues email notifications.
   *
   * @param dateFrom - Start date of analysis period (UTC)
   * @param dateTo - End date of analysis period (UTC)
   * @returns Summary of job execution with counts
   */
  async runForAllUsers(
    dateFrom: Date,
    dateTo: Date
  ): Promise<AnalysisJobResult> {
    let skip = 0;
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalCompleted = 0;
    let totalFailed = 0;
    let iterations = 0;

    const reviewBatch: Array<{ userId: string; reviewText: string }> = [];
    const emailBatch: Array<{
      userEmail: string;
      reviewText: string;
      periodFrom: string;
      periodTo: string;
    }> = [];

    // Paginate through all users
    while (true) {
      iterations++;

      if (iterations > analysisConfig.MAX_ITERATIONS) {
        log.error({
          message: `Exceeded max iterations (${analysisConfig.MAX_ITERATIONS}), breaking loop`,
          error: new Error('Max iterations exceeded'),
          code: 'ANALYSIS_MAX_ITERATIONS',
        });
        break;
      }

      const users = await this.#userService.find({
        take: analysisConfig.BATCH_SIZE,
        skip,
      });

      if (users.length === 0) {
        log.info(`No more users to process, ending pagination at skip=${skip}`);
        break;
      }

      log.info(
        `Processing batch: skip=${skip}, count=${users.length}, period=${dateFrom.toISOString()} to ${dateTo.toISOString()}`
      );

      // Process each user in the batch
      for (const user of users) {
        try {
          const reviewData = await this.#processUserAnalysis(
            user.id,
            user.email,
            dateFrom,
            dateTo
          );

          if (!reviewData) {
            totalSkipped++;
            continue;
          }

          totalProcessed++;

          // Add to batches
          reviewBatch.push({
            userId: reviewData.userId,
            reviewText: reviewData.reviewText,
          });

          emailBatch.push({
            userEmail: reviewData.userEmail,
            reviewText: reviewData.reviewText,
            periodFrom: dateFrom.toISOString(),
            periodTo: dateTo.toISOString(),
          });

          // Flush when batch size reached
          if (reviewBatch.length >= analysisConfig.REVIEW_BATCH_SIZE) {
            // Persist reviews to database first
            const count =
              await this.#transactionReviewService.createMany(reviewBatch);
            log.info(`Batch created ${count} transaction reviews`);

            // After successful persistence, enqueue email notifications
            await this.#sendEmailQueueService.addBulkJobs(
              emailBatch.map((data) => ({
                templateId: TemplateNames.TRANSACTION_REVIEW_RESULT,
                userEmail: data.userEmail,
                data: {
                  userEmail: data.userEmail,
                  reviewText: data.reviewText,
                  periodFrom: data.periodFrom,
                  periodTo: data.periodTo,
                },
              }))
            );
            log.info(`Enqueued ${emailBatch.length} email notifications`);

            // Clear batches
            reviewBatch.length = 0;
            emailBatch.length = 0;
          }

          totalCompleted++;
        } catch (userError) {
          totalFailed++;
          log.error({
            message: `Failed to analyze userId: ${user.id}`,
            error: userError,
            code: 'USER_ANALYSIS_ERROR',
          });
          // Continue processing other users
        }
      }

      skip += analysisConfig.BATCH_SIZE;

      log.info(
        `Batch complete: processed=${totalProcessed}, skipped=${totalSkipped}, completed=${totalCompleted}, failed=${totalFailed}`
      );
    }

    // Flush remaining reviews
    if (reviewBatch.length > 0) {
      // Persist reviews to database first
      const count =
        await this.#transactionReviewService.createMany(reviewBatch);
      log.info(`Final batch created ${count} transaction reviews`);

      // After successful persistence, enqueue email notifications
      await this.#sendEmailQueueService.addBulkJobs(
        emailBatch.map((data) => ({
          templateId: TemplateNames.TRANSACTION_REVIEW_RESULT,
          userEmail: data.userEmail,
          data: {
            userEmail: data.userEmail,
            reviewText: data.reviewText,
            periodFrom: data.periodFrom,
            periodTo: data.periodTo,
          },
        }))
      );
      log.info(
        `Final flush: Enqueued ${emailBatch.length} email notifications`
      );
    }

    return {
      period: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
      },
      totalProcessed,
      totalSkipped,
      totalCompleted,
      totalFailed,
    };
  }

  /**
   * Processes analysis for a single user: acquires lock, runs analysis,
   * generates review, and marks run as completed.
   *
   * @param userId - User identifier
   * @param userEmail - User email for notifications
   * @param dateFrom - Analysis period start
   * @param dateTo - Analysis period end
   * @returns Review data if successful, null if user should be skipped
   * @private
   */
  async #processUserAnalysis(
    userId: string,
    userEmail: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<UserReviewData | null> {
    // Attempt to acquire lock for this user+period
    const analysisRun = await this.#analysisRunRepository.startOrSkip(
      userId,
      dateFrom,
      dateTo
    );

    if (!analysisRun) {
      log.info(`Skipped userId: ${userId} - already processing or completed`);
      return null;
    }

    // Perform spending analysis
    const result = await this.#spendingAnalysisService.analyzePeriod(
      userId,
      dateFrom,
      dateTo,
      { thresholdBuffer: 0.05 }
    );

    // Log analysis result
    this.#logAnalysisResult(result);

    // Generate review text
    const reviewText =
      await this.#reviewGenerationService.generateReview(result);

    // Mark analysis run as completed
    analysisRun.markAsCompleted();
    await this.#analysisRunRepository.save(analysisRun);

    log.info(
      `Completed analysis for userId: ${userId}, spending: $${result.totalSpendingUsd.toFixed(2)}, breaches: ${result.categories.filter((c) => c.breached).length}`
    );

    return {
      userId,
      userEmail,
      reviewText,
    };
  }

  /**
   * Logs structured analysis result with category details
   * @private
   */
  #logAnalysisResult(result: AnalysisResult): void {
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
        deltaPct: cat.breached ? `+${cat.deltaPct.toFixed(2)}%` : '0.00%',
        breached: cat.breached,
      })),
      breachedCategories: result.categories
        .filter((c) => c.breached)
        .map((c) => c.category),
    };

    log.info(
      `Category Weight Analysis Result | ${JSON.stringify(analysisResult)}`
    );
  }
}
