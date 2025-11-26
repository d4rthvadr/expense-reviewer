import { CategoryWeightAnalysisProcessor } from '../../../../../../src/infra/queues/cron/processors/category-weight-analysis.processor';
import { Job } from 'bullmq';
import { createMockCategoryWeightAnalysisOrchestrator } from '@tests/__mocks__';

describe('CategoryWeightAnalysisProcessor', () => {
  let processor: CategoryWeightAnalysisProcessor;
  let mockJob: Partial<Job>;
  let mockOrchestrator: ReturnType<
    typeof createMockCategoryWeightAnalysisOrchestrator
  >;

  beforeEach(() => {
    // Create fresh mock instances before each test
    mockOrchestrator = createMockCategoryWeightAnalysisOrchestrator();

    processor = new CategoryWeightAnalysisProcessor(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockOrchestrator as any
    );

    mockJob = {
      id: 'test-job-123',
      attemptsMade: 1,
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('process()', () => {
    it('should delegate complete workflow to orchestrator', async () => {
      // Arrange
      const mockSummary = {
        period: {
          from: '2025-11-11T00:00:00.000Z',
          to: '2025-11-25T23:59:59.999Z',
        },
        totalProcessed: 2,
        totalSkipped: 0,
        totalCompleted: 2,
        totalFailed: 0,
      };

      // Mock orchestrator to return summary
      (mockOrchestrator.runForAllUsers as jest.Mock).mockResolvedValue(
        mockSummary
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert - verify orchestrator was called with correct period only (no callback)
      expect(mockOrchestrator.runForAllUsers).toHaveBeenCalledTimes(1);
      const orchestratorCall = (mockOrchestrator.runForAllUsers as jest.Mock)
        .mock.calls[0];
      expect(orchestratorCall[0]).toBeInstanceOf(Date); // dateFrom
      expect(orchestratorCall[1]).toBeInstanceOf(Date); // dateTo
      expect(orchestratorCall[2]).toBeUndefined(); // No callback parameter

      // Verify period is approximately 14 days
      const dateFrom = orchestratorCall[0];
      const dateTo = orchestratorCall[1];
      expect(dateTo.getTime() - dateFrom.getTime()).toBeGreaterThanOrEqual(
        14 * 24 * 60 * 60 * 1000
      );
    });

    it('should calculate rolling 14-day period correctly', async () => {
      // Arrange
      const mockSummary = {
        period: {
          from: '2025-11-11T00:00:00.000Z',
          to: '2025-11-25T23:59:59.999Z',
        },
        totalProcessed: 0,
        totalSkipped: 0,
        totalCompleted: 0,
        totalFailed: 0,
      };

      (mockOrchestrator.runForAllUsers as jest.Mock).mockResolvedValue(
        mockSummary
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert - check that orchestrator was called with dates
      const orchestratorCall = (mockOrchestrator.runForAllUsers as jest.Mock)
        .mock.calls[0];
      const dateFrom = orchestratorCall[0];
      const dateTo = orchestratorCall[1];

      expect(dateFrom).toBeInstanceOf(Date);
      expect(dateTo).toBeInstanceOf(Date);
      expect(dateTo.getTime() - dateFrom.getTime()).toBeGreaterThanOrEqual(
        14 * 24 * 60 * 60 * 1000
      ); // At least 14 days
    });

    it('should propagate errors from orchestrator', async () => {
      // Arrange
      const criticalError = new Error('Orchestrator failed');
      (mockOrchestrator.runForAllUsers as jest.Mock).mockRejectedValue(
        criticalError
      );

      // Act & Assert
      await expect(processor.process(mockJob as Job)).rejects.toThrow(
        'Orchestrator failed'
      );
    });

    it('should handle empty batches gracefully', async () => {
      // Arrange
      const mockSummary = {
        period: {
          from: '2025-11-11T00:00:00.000Z',
          to: '2025-11-25T23:59:59.999Z',
        },
        totalProcessed: 0,
        totalSkipped: 0,
        totalCompleted: 0,
        totalFailed: 0,
      };

      // Orchestrator doesn't call batch flush callback
      (mockOrchestrator.runForAllUsers as jest.Mock).mockResolvedValue(
        mockSummary
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert - orchestrator should be called
      expect(mockOrchestrator.runForAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple email notification batches', async () => {
      // Arrange
      const mockSummary = {
        period: {
          from: '2025-11-11T00:00:00.000Z',
          to: '2025-11-25T23:59:59.999Z',
        },
        totalProcessed: 2,
        totalSkipped: 0,
        totalCompleted: 2,
        totalFailed: 0,
      };

      (mockOrchestrator.runForAllUsers as jest.Mock).mockResolvedValue(
        mockSummary
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert - orchestrator handles batching internally
      expect(mockOrchestrator.runForAllUsers).toHaveBeenCalledTimes(1);
    });
  });
});
