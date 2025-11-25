import { AnalysisRunModel } from '@domain/models/analysis-run.model';
import { AnalysisRun as AnalysisRunEntity } from '../../../../generated/prisma';
import { convertNullToUndefined } from './utils';

/* eslint-disable no-unused-vars */
export function mapAnalysisRun(entity: AnalysisRunEntity): AnalysisRunModel;
export function mapAnalysisRun(entity: null): null;
export function mapAnalysisRun(
  entity: AnalysisRunEntity | null
): AnalysisRunModel | null;
/* eslint-enable no-unused-vars */
export function mapAnalysisRun(
  entity: AnalysisRunEntity | null
): AnalysisRunModel | null {
  if (!entity) {
    return null;
  }

  return new AnalysisRunModel({
    id: entity.id,
    userId: entity.userId,
    periodStart: entity.periodStart,
    periodEnd: entity.periodEnd,
    status: entity.status,
    attemptCount: entity.attemptCount,
    lastError: convertNullToUndefined(entity.lastError),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
