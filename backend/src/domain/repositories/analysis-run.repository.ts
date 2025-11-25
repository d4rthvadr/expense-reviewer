import { log } from '@infra/logger';
import { Database } from '@infra/db/database';
import {
  AnalysisRun as AnalysisRunEntity,
  AnalysisRunStatus,
} from '../../../generated/prisma';
import { AnalysisRunModel } from '@domain/models/analysis-run.model';
import { mapAnalysisRun } from './helpers/map-analysis-run';

export { AnalysisRunStatus };

export class AnalysisRunRepository extends Database {
  /**
   * Attempts to start or skip an analysis run for a user and period.
   * Uses INSERT ... ON CONFLICT to handle concurrency via Postgres row locking.
   *
   * @returns The AnalysisRunModel if successfully locked for processing, or null if already processing/completed
   */
  async startOrSkip(
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<AnalysisRunModel | null> {
    try {
      // Try to insert new record or update existing PENDING/FAILED record to PROCESSING
      const result = await this.$queryRaw<AnalysisRunEntity[]>`
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

      return mapAnalysisRun(result[0]);
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
   * Saves an analysis run model to the database
   */
  async save(data: AnalysisRunModel): Promise<AnalysisRunModel> {
    try {
      const savedEntity: AnalysisRunEntity = await this.analysisRun.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          userId: data.userId,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          status: data.status,
          attemptCount: data.attemptCount,
          lastError: data.lastError,
        },
        update: {
          status: data.status,
          attemptCount: data.attemptCount,
          lastError: data.lastError,
          updatedAt: new Date(),
        },
      });

      return mapAnalysisRun(savedEntity);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving analysis run:',
        error,
        code: 'ANALYSIS_RUN_SAVE_ERROR',
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
  ): Promise<AnalysisRunModel[]> {
    try {
      const entities: AnalysisRunEntity[] = await this.analysisRun.findMany({
        where: { status },
        take: limit,
        orderBy: { createdAt: 'asc' },
      });

      return entities.map((entity) => mapAnalysisRun(entity));
    } catch (error) {
      log.error({
        message: `Error finding analysis runs by status: ${status}`,
        error,
        code: 'ANALYSIS_RUN_FIND_ERROR',
      });
      throw error;
    }
  }

  /**
   * Finds stale analysis runs still in PROCESSING status
   * older than the specified date threshold
   */
  async findStale(beforeDate: Date): Promise<AnalysisRunModel[]> {
    try {
      const entities: AnalysisRunEntity[] = await this.analysisRun.findMany({
        where: {
          status: AnalysisRunStatus.PROCESSING,
          updatedAt: {
            lt: beforeDate,
          },
        },
      });

      return entities.map((entity) => mapAnalysisRun(entity));
    } catch (error) {
      log.error({
        message: 'Error finding stale analysis runs:',
        error,
        code: 'ANALYSIS_RUN_FIND_STALE_ERROR',
      });
      throw error;
    }
  }
}

export const analysisRunRepository = new AnalysisRunRepository();
