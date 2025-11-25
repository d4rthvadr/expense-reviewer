import { log } from '@infra/logger';
import { AgentService } from './agent.service';
import { format } from 'date-fns';
import { analysisConfig } from '@config/analysis.config';

export interface AnalysisResult {
  userId: string;
  period: { from: Date; to: Date };
  totalSpendingUsd: number;
  categories: Array<{
    category: string;
    weight: number;
    spendUsd: number;
    actualShare: number;
    deltaPct: number;
    breached: boolean;
  }>;
}

export class ReviewGenerationService {
  #agentService: AgentService;

  constructor(agentService: AgentService) {
    this.#agentService = agentService;
  }

  /**
   * Generates a review using AI with fallback to formatted text and timeout protection
   */
  async generateReview(result: AnalysisResult): Promise<string> {
    try {
      const startTime = Date.now();
      const prompt = this.buildPrompt(result);

      log.info(
        `Generating AI review for user | promptLength: ${prompt.length}, totalSpending: ${result.totalSpendingUsd}, breachedCategories: ${result.categories.filter((c) => c.breached).length}`
      );

      // Race between AI generation and timeout
      const aiReview = await Promise.race([
        this.#agentService.generateAIResponse(prompt),
        this.createTimeout(analysisConfig.AI_TIMEOUT_MS),
      ]);

      const duration = Date.now() - startTime;

      log.info(
        `Successfully generated AI review | durationMs: ${duration}, reviewLength: ${aiReview.length}`
      );

      return aiReview;
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'Unknown';
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const breachedCount = result.categories.filter((c) => c.breached).length;

      log.error({
        message: `AI review generation failed, falling back to formatted review | totalSpending: $${result.totalSpendingUsd}, categoriesCount: ${result.categories.length}, breachedCount: ${breachedCount}, errorName: ${errorName}, errorMessage: ${errorMessage}`,
        error,
        code: 'AI_REVIEW_GENERATION_FAILED',
      });

      // Fallback to formatted review
      return this.formatFallbackReview(result);
    }
  }

  /**
   * Creates a timeout promise that rejects after specified milliseconds
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`AI generation timeout after ${ms}ms`)),
        ms
      )
    );
  }

  /**
   * Builds an AI prompt for creating a personalized spending review
   */
  private buildPrompt(result: AnalysisResult): string {
    const periodFrom = format(result.period.from, 'MMM dd, yyyy');
    const periodTo = format(result.period.to, 'MMM dd, yyyy');
    const breachedCategories = result.categories.filter((c) => c.breached);

    let prompt = `You are a personal finance advisor. Generate a friendly, personalized spending analysis report for a user based on the following data:\n\n`;
    prompt += `**Analysis Period:** ${periodFrom} to ${periodTo} (14-day rolling window)\n`;
    prompt += `**Total Spending:** $${result.totalSpendingUsd.toFixed(2)} USD\n\n`;

    if (breachedCategories.length > 0) {
      prompt += `**Categories Over Budget (${breachedCategories.length}):**\n`;
      breachedCategories.forEach((cat) => {
        prompt += `- ${cat.category}: Spent $${cat.spendUsd.toFixed(2)} (${(cat.actualShare * 100).toFixed(1)}% of total) vs target ${(cat.weight * 100).toFixed(1)}%, exceeded by ${cat.deltaPct.toFixed(1)}%\n`;
      });
      prompt += `\n`;
    }

    prompt += `**All Categories Breakdown:**\n`;
    result.categories
      .sort((a, b) => b.spendUsd - a.spendUsd)
      .forEach((cat) => {
        const status = cat.breached ? 'OVER' : 'Within';
        prompt += `- ${cat.category}: $${cat.spendUsd.toFixed(2)} (${(cat.actualShare * 100).toFixed(1)}% actual vs ${(cat.weight * 100).toFixed(1)}% target) - ${status}\n`;
      });

    prompt += `\n**Instructions:**\n`;
    prompt += `1. Create a warm, encouraging, and actionable spending report in markdown format\n`;
    prompt += `2. Start with a brief summary of their overall spending health\n`;
    prompt += `3. If there are overspending categories, provide specific, practical tips to reduce spending in those areas\n`;
    prompt += `4. If they're doing well, congratulate them and encourage continued good habits\n`;
    prompt += `5. Keep the tone conversational but professional\n`;
    prompt += `6. Use emojis sparingly (✅, ⚠️, 💡, 🎯) to make it engaging\n`;
    prompt += `7. End with a motivational note\n`;
    prompt += `8. Format the report using markdown with headers, bullet points, and emphasis\n\n`;
    prompt += `Generate the report now:`;

    return prompt;
  }

  /**
   * Formats analysis result into a human-readable review text (fallback)
   */
  private formatFallbackReview(result: AnalysisResult): string {
    const periodFrom = format(result.period.from, 'MMM dd, yyyy');
    const periodTo = format(result.period.to, 'MMM dd, yyyy');
    const breachedCategories = result.categories.filter((c) => c.breached);

    let reviewText = `# Spending Analysis Report\n\n`;
    reviewText += `**Period:** ${periodFrom} - ${periodTo}\n`;
    reviewText += `**Total Spending:** $${result.totalSpendingUsd.toFixed(2)} USD\n\n`;

    if (breachedCategories.length === 0) {
      reviewText += `✅ **Great job!** All spending categories are within your target allocations.\n\n`;
    } else {
      reviewText += `⚠️ **Attention Required:** ${breachedCategories.length} ${breachedCategories.length === 1 ? 'category has' : 'categories have'} exceeded target allocations.\n\n`;
      reviewText += `## Categories Over Budget\n\n`;

      breachedCategories.forEach((cat) => {
        reviewText += `### ${cat.category}\n`;
        reviewText += `- **Target Allocation:** ${(cat.weight * 100).toFixed(1)}%\n`;
        reviewText += `- **Actual Spending:** $${cat.spendUsd.toFixed(2)} (${(cat.actualShare * 100).toFixed(1)}%)\n`;
        reviewText += `- **Overage:** ${cat.deltaPct.toFixed(1)}% above target\n\n`;
      });
    }

    reviewText += `## All Categories Breakdown\n\n`;
    result.categories
      .sort((a, b) => b.spendUsd - a.spendUsd)
      .forEach((cat) => {
        const status = cat.breached ? '⚠️' : '✅';
        reviewText += `${status} **${cat.category}:** $${cat.spendUsd.toFixed(2)} (${(cat.actualShare * 100).toFixed(1)}% vs ${(cat.weight * 100).toFixed(1)}% target)\n`;
      });

    reviewText += `\n---\n`;
    reviewText += `*This report was automatically generated based on your spending patterns and category weight preferences.*`;

    return reviewText;
  }
}

// Singleton instance
import { agentService } from './agent.service';
export const reviewGenerationService = new ReviewGenerationService(
  agentService
);
