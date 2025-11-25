export type AnalysisConfig = {
  BATCH_SIZE: number;
  REVIEW_BATCH_SIZE: number;
  AI_TIMEOUT_MS: number;
  STALE_THRESHOLD_HOURS: number;
  MAX_ITERATIONS: number;
};

/**
 * Configuration for analysis and background processing
 */

export const analysisConfig = {
  // Batch size for user pagination in analysis processor
  BATCH_SIZE: 200,

  // Batch size for creating transaction reviews
  REVIEW_BATCH_SIZE: 100,

  // Timeout for AI generation in milliseconds (30 seconds)
  AI_TIMEOUT_MS: 30000,

  // Threshold for marking analysis runs as stale (in hours)
  STALE_THRESHOLD_HOURS: 2,

  // Max iterations to prevent infinite loops
  MAX_ITERATIONS: 10000,
} satisfies AnalysisConfig;
