import { AnalysisRunModel } from '@domain/models/analysis-run.model';
import {
  AnalysisRunRepository,
  AnalysisRunStatus,
} from '@domain/repositories/analysis-run.repository';
import { log } from '@infra/logger';

export class AnalysisRunService {
  #repository: AnalysisRunRepository;

  constructor(repository: AnalysisRunRepository) {
    this.#repository = repository;
  }

  /**
   * Attempts to start or skip an analysis run for a user and period.
   * Delegates to repository for atomic concurrency handling.
   */
  async startOrSkip(
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<AnalysisRunModel | null> {
    return await this.#repository.startOrSkip(userId, periodStart, periodEnd);
  }

  /**
   * Saves an analysis run
   */
  async save(analysisRun: AnalysisRunModel): Promise<AnalysisRunModel> {
    return await this.#repository.save(analysisRun);
  }

  /**
   * Finds analysis runs by status
   */
  async findByStatus(
    status: AnalysisRunStatus,
    limit = 100
  ): Promise<AnalysisRunModel[]> {
    log.info(`Finding analysis runs with status: ${status}, limit: ${limit}`);

    return await this.#repository.find({
      where: { status },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Finds stale analysis runs still in PROCESSING status
   * older than the specified date threshold
   */
  async findStale(beforeDate: Date): Promise<AnalysisRunModel[]> {
    log.info(
      `Finding stale analysis runs updated before: ${beforeDate.toISOString()}`
    );

    return await this.#repository.find({
      where: {
        status: AnalysisRunStatus.PROCESSING,
        updatedAt: {
          lt: beforeDate,
        },
      },
    });
  }
}

export const analysisRunService = new AnalysisRunService(
  new AnalysisRunRepository()
);
