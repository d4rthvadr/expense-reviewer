import { CategoryWeightAnalysisOrchestrator } from '@domain/services/category-weight-analysis-orchestrator.service';

/**
 * Creates a mock CategoryWeightAnalysisOrchestrator for testing
 */
export function createMockCategoryWeightAnalysisOrchestrator() {
  return {
    runForAllUsers: jest.fn().mockResolvedValue({
      period: {
        from: '2025-11-12T00:00:00.000Z',
        to: '2025-11-26T23:59:59.999Z',
      },
      totalProcessed: 0,
      totalSkipped: 0,
      totalCompleted: 0,
      totalFailed: 0,
    }),
  } as unknown as CategoryWeightAnalysisOrchestrator;
}
