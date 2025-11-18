import { log } from '@infra/logger';
import { Category } from '@domain/enum/category.enum';
import {
  CategoryWeightService,
  categoryWeightService,
} from './category-weight.service';
import {
  NotificationService,
  notificationService,
} from './notification.service';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import {
  AnalyticsRepository,
  analyticsRepository,
} from '@domain/repositories/analytics.repository';

export interface CategorySpendingData {
  category: Category;
  actualSpending: number; // in USD
  targetWeight: number; // percentage (0-1)
  actualWeight: number; // percentage (0-1)
  isOverThreshold: boolean;
  thresholdExceeded?: number; // percentage over threshold
}

export interface SpendingAnalysisResult {
  userId: string;
  totalSpending: number; // in USD
  analysisDate: Date;
  categories: CategorySpendingData[];
  overThresholdCategories: CategorySpendingData[];
}

export interface ThresholdEvaluationOptions {
  dateFrom: Date;
  dateTo: Date;
  notifyOnBreach?: boolean; // default: false
  thresholdBuffer?: number; // percentage buffer before triggering (default: 0.05 = 5%)
}

export class SpendingAnalysisService {
  #categoryWeightService: CategoryWeightService;
  #notificationService: NotificationService;
  #analyticsRepository: AnalyticsRepository;

  constructor(
    categoryWeightService: CategoryWeightService,
    notificationService: NotificationService,
    analyticsRepository: AnalyticsRepository
  ) {
    this.#categoryWeightService = categoryWeightService;
    this.#notificationService = notificationService;
    this.#analyticsRepository = analyticsRepository;
  }

  /**
   * Analyze spending against category weight preferences
   */
  async analyzeSpending(
    userId: string,
    options: ThresholdEvaluationOptions
  ): Promise<SpendingAnalysisResult> {
    try {
      log.info(
        `Analyzing spending for userId: ${userId} from ${options.dateFrom} to ${options.dateTo}`
      );

      // Get user's effective category weights
      const categoryWeights =
        await this.#categoryWeightService.getEffectiveWeights(userId);

      // Get actual spending by category for the period
      const spendingData = await this.#getSpendingByCategory(
        userId,
        options.dateFrom,
        options.dateTo
      );

      // Calculate total spending
      const totalSpending = spendingData.reduce((sum, item) => {
        return sum + Number(item.transaction_amount_usd || 0);
      }, 0);

      // Analyze each category
      const categoryAnalysis: CategorySpendingData[] = [];
      const overThresholdCategories: CategorySpendingData[] = [];

      for (const weight of categoryWeights) {
        const spending = spendingData.find(
          (item: { category: string }) => item.category === weight.category
        );
        const actualSpending = spending?.transaction_amount_usd || 0;
        const actualWeight =
          totalSpending > 0 ? actualSpending / totalSpending : 0;

        const thresholdBuffer = options.thresholdBuffer || 0.05;
        const threshold = weight.weight + thresholdBuffer;
        const isOverThreshold = actualWeight > threshold;

        const categoryData: CategorySpendingData = {
          category: weight.category,
          actualSpending,
          targetWeight: weight.weight,
          actualWeight,
          isOverThreshold,
          thresholdExceeded: isOverThreshold
            ? ((actualWeight - weight.weight) / weight.weight) * 100
            : undefined,
        };

        categoryAnalysis.push(categoryData);

        if (isOverThreshold) {
          overThresholdCategories.push(categoryData);
        }
      }

      const result = {
        userId,
        totalSpending,
        analysisDate: new Date(),
        categories: categoryAnalysis,
        overThresholdCategories,
      } satisfies SpendingAnalysisResult;

      // Send notifications for threshold breaches if enabled
      if (options.notifyOnBreach && overThresholdCategories.length > 0) {
        await this.#notifyThresholdBreaches(
          userId,
          overThresholdCategories,
          options
        );
      }

      log.info(
        `Spending analysis completed for userId: ${userId}. 
          Categories over threshold: ${overThresholdCategories.length} | meta: ${JSON.stringify(
            {
              totalSpending: totalSpending.toFixed(2),
              overThresholdCount: overThresholdCategories.length,
              result,
            },
            null,
            3
          )}`
      );

      return result;
    } catch (error) {
      log.error({
        message: `Error analyzing spending for userId: ${userId}`,
        error,
        code: 'SPENDING_ANALYSIS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Evaluate thresholds for a user and send notifications if breached
   */
  async evaluateThresholds(
    userId: string,
    options: ThresholdEvaluationOptions
  ): Promise<CategorySpendingData[]> {
    const analysis = await this.analyzeSpending(userId, {
      ...options,
      notifyOnBreach: true,
    });

    return analysis.overThresholdCategories;
  }

  /**
   * Get current month spending analysis for a user
   */
  async getCurrentMonthAnalysis(
    userId: string,
    notifyOnBreach = false
  ): Promise<SpendingAnalysisResult> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return this.analyzeSpending(userId, {
      dateFrom: startOfMonth,
      dateTo: endOfMonth,
      notifyOnBreach,
      thresholdBuffer: 0.05, // 5% buffer
    });
  }

  /**
   * Get spending by category from analytics repository
   */
  async #getSpendingByCategory(userId: string, dateFrom: Date, dateTo: Date) {
    // Use the existing analytics repository method that gets transaction totals by category
    const budgetVsTransactionData =
      await this.#analyticsRepository.getBudgetVsTransactionData(
        dateFrom,
        dateTo,
        userId
      );

    // Map to the format we need (we only care about the transaction amounts)
    return budgetVsTransactionData.map(
      (item: {
        category: string;
        transaction_amount_usd: number | string;
      }) => ({
        category: item.category as Category,
        transaction_amount_usd: Number(item.transaction_amount_usd || 0),
      })
    );
  }

  /**
   * Send threshold breach notifications
   */
  async #notifyThresholdBreaches(
    userId: string,
    overThresholdCategories: CategorySpendingData[],
    options: ThresholdEvaluationOptions
  ): Promise<void> {
    for (const category of overThresholdCategories) {
      try {
        await this.#notificationService.notifyCategoryThresholdBreach({
          userId,
          category: category.category,
          severity: NotificationSeverity.WARNING,
          weight: category.targetWeight,
          actualShare: category.actualWeight,
          deltaPct: category.thresholdExceeded || 0,
          period: `${options.dateFrom.getFullYear()}-${String(options.dateFrom.getMonth() + 1).padStart(2, '0')}`,
        });

        log.info(
          `Sent threshold breach notification for userId: ${userId}, ` +
            `category: ${category.category}, exceeded by: ${category.thresholdExceeded?.toFixed(1)}%`
        );
      } catch (error) {
        log.error({
          message: `Failed to send threshold breach notification for userId: ${userId}, category: ${category.category}`,
          error,
          code: 'THRESHOLD_NOTIFICATION_ERROR',
        });
        // Continue with other notifications even if one fails
      }
    }
  }
}

export const spendingAnalysisService = new SpendingAnalysisService(
  categoryWeightService,
  notificationService,
  analyticsRepository
);
