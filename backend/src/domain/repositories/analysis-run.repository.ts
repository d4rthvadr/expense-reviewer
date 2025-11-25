import { log } from '@infra/logger';
import { Database } from '@infra/db/database';
import { AnalysisRun, AnalysisRunStatus } from '../../../generated/prisma';

export { AnalysisRunStatus };

export class AnalysisRunRepository extends Database {
  /**
   * Attempts to start or skip an analysis run for a user and period.
   * Uses INSERT ... ON CONFLICT to handle concurrency via Postgres row locking.
   *
   * @returns The AnalysisRun if successfully locked for processing, or null if already processing/completed
   */
  async startOrSkip(
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<AnalysisRun | null> {
    try {
      // Try to insert new record or update existing PENDING/FAILED record to PROCESSING
      const result = await this.$queryRaw<AnalysisRun[]>`
        INSERT INTO "AnalysisRun" ("id", "userId", "periodStart", "periodEnd", "status", "attemptCount", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${userId}, ${periodStart}, ${periodEnd}, ${AnalysisRunStatus.PROCESSING}::\"AnalysisRunStatus\", 1, NOW(), NOW())
        ON CONFLICT ("userId", "periodStart", "periodEnd")
        DO UPDATE SET
          "status" = CASE
            WHEN "AnalysisRun"."status" IN (${AnalysisRunStatus.PENDING}::\"AnalysisRunStatus\", ${AnalysisRunStatus.FAILED}::\"AnalysisRunStatus\")
            THEN ${AnalysisRunStatus.PROCESSING}::\"AnalysisRunStatus\"
            ELSE "AnalysisRun"."status"
          END,
          "attemptCount" = CASE
            WHEN "AnalysisRun"."status" IN (${AnalysisRunStatus.PENDING}::\"AnalysisRunStatus\", ${AnalysisRunStatus.FAILED}::\"AnalysisRunStatus\")
            THEN "AnalysisRun"."attemptCount" + 1
            ELSE "AnalysisRun"."attemptCount"
          END,
          "updatedAt" = NOW()
        WHERE "AnalysisRun"."status" IN (${AnalysisRunStatus.PENDING}::\"AnalysisRunStatus\", ${AnalysisRunStatus.FAILED}::\"AnalysisRunStatus\")
        RETURNING *;
      `;

      if (result.length === 0) {
        log.info(
          `Analysis run already processing or completed for userId: ${userId}, period: ${periodStart.toISOString()} - ${periodEnd.toISOString()}`
        );
        return null;
      }

      return result[0];
    } catch (error) {
      log.error({
        message: `Error starting analysis run for userId: ${userId}`,
        error,
        code: 'ANALYSIS_RUN_START_ERROR',
      });
      throw error;
    }
  }

  /**
   * Updates the status of an analysis run.
   *
   * @param id - The unique identifier of the analysis run to update
   * @param status - The new status to set for the analysis run
   * @param lastError - Optional error message to store if the run encountered an error
   * @returns A promise that resolves to the updated AnalysisRun entity
   * @throws Will throw an error if the database update operation fails
   */
  async updateRunStatus(
    id: string,
    status: AnalysisRunStatus,
    lastError?: string
  ): Promise<AnalysisRun> {
    try {
      return await this.analysisRun.update({
        where: { id },
        data: {
          status,
          lastError,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      log.error({
        message: `Error updating analysis run status: ${id}`,
        error,
        code: 'ANALYSIS_RUN_UPDATE_STATUS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Finds analysis runs by status
   */
  async findByStatus(
    status: AnalysisRunStatus,
    limit = 100
  ): Promise<AnalysisRun[]> {
    try {
      return await this.analysisRun.findMany({
        where: { status },
        take: limit,
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      log.error({
        message: `Error finding analysis runs by status: ${status}`,
        error,
        code: 'ANALYSIS_RUN_FIND_ERROR',
      });
      throw error;
    }
  }
}

export const analysisRunRepository = new AnalysisRunRepository();
