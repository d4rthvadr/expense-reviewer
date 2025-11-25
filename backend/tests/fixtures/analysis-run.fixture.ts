import { AnalysisRunModel } from '@domain/models/analysis-run.model';
import { AnalysisRunStatus } from '@domain/repositories/analysis-run.repository';

export const createMockAnalysisRun = (
  overrides?: Partial<{
    id: string;
    userId: string;
    periodStart: Date;
    periodEnd: Date;
    status: AnalysisRunStatus;
    attemptCount: number;
    lastError: string | undefined;
    createdAt: Date;
    updatedAt: Date;
  }>
): AnalysisRunModel => {
  return new AnalysisRunModel({
    id: 'run-123',
    userId: 'user-123',
    periodStart: new Date('2025-11-11'),
    periodEnd: new Date('2025-11-25'),
    status: AnalysisRunStatus.PENDING,
    attemptCount: 0,
    lastError: undefined,
    createdAt: new Date('2025-11-25'),
    updatedAt: new Date('2025-11-25'),
    ...overrides,
  });
};
