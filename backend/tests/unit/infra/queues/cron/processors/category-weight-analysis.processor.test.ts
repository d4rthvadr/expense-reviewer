import { CategoryWeightAnalysisProcessor } from '../../../../../../src/infra/queues/cron/processors/category-weight-analysis.processor';
import { Job } from 'bullmq';
import { AnalysisRunModel } from '@domain/models/analysis-run.model';
import { AnalysisRunStatus } from '@domain/repositories/analysis-run.repository';
import {
  createMockUserService,
  createMockSpendingAnalysisService,
  createMockAnalysisRunRepository,
} from '@tests/__mocks__';

describe('CategoryWeightAnalysisProcessor', () => {
  let processor: CategoryWeightAnalysisProcessor;
  let mockJob: Partial<Job>;
  let mockUserService: ReturnType<typeof createMockUserService>;
  let mockSpendingAnalysisService: ReturnType<
    typeof createMockSpendingAnalysisService
  >;
  let mockAnalysisRunRepository: ReturnType<
    typeof createMockAnalysisRunRepository
  >;

  beforeEach(() => {
    // Create fresh mock instances before each test
    mockUserService = createMockUserService();
    mockSpendingAnalysisService = createMockSpendingAnalysisService();
    mockAnalysisRunRepository = createMockAnalysisRunRepository();

    processor = new CategoryWeightAnalysisProcessor(
      mockUserService,
      mockSpendingAnalysisService,
      mockAnalysisRunRepository
    );

    mockJob = {
      id: 'test-job-123',
      attemptsMade: 1,
    };
  });

  describe('process()', () => {
    it('should process all users in batches successfully', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', email: 'user1@test.com' },
        { id: 'user-2', email: 'user2@test.com' },
      ];

      const mockAnalysisRun = {
        id: 'run-123',
        userId: 'user-1',
        status: AnalysisRunStatus.PROCESSING,
        markAsCompleted: jest.fn(),
      } as unknown as AnalysisRunModel;

      const mockAnalysisResult = {
        userId: 'user-1',
        period: {
          from: new Date('2025-11-11'),
          to: new Date('2025-11-25'),
        },
        totalSpendingUsd: 1500,
        categories: [
          {
            category: 'FOOD',
            weight: 0.3,
            actualShare: 0.4,
            spendUsd: 600,
            deltaPct: 10,
            breached: true,
          },
        ],
      };

      // First batch returns 2 users, second batch returns empty
      (mockUserService.find as jest.Mock)
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([]);

      (mockAnalysisRunRepository.startOrSkip as jest.Mock).mockResolvedValue(
        mockAnalysisRun
      );
      (
        mockSpendingAnalysisService.analyzePeriod as jest.Mock
      ).mockResolvedValue(mockAnalysisResult);
      (mockAnalysisRunRepository.save as jest.Mock).mockResolvedValue(
        mockAnalysisRun
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert
      expect(mockUserService.find).toHaveBeenCalledTimes(2);
      expect(mockUserService.find).toHaveBeenCalledWith({
        take: 200,
        skip: 0,
      });
      expect(mockUserService.find).toHaveBeenCalledWith({
        take: 200,
        skip: 200,
      });

      expect(mockAnalysisRunRepository.startOrSkip).toHaveBeenCalledTimes(2);
      expect(mockSpendingAnalysisService.analyzePeriod).toHaveBeenCalledTimes(
        2
      );
      expect(mockAnalysisRun.markAsCompleted).toHaveBeenCalledTimes(2);
      expect(mockAnalysisRunRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should skip users that are already processing or completed', async () => {
      // Arrange
      const mockUsers = [{ id: 'user-1', email: 'user1@test.com' }];

      (mockUserService.find as jest.Mock)
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([]);

      // Return null to indicate already processing/completed
      (mockAnalysisRunRepository.startOrSkip as jest.Mock).mockResolvedValue(
        null
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert
      expect(mockAnalysisRunRepository.startOrSkip).toHaveBeenCalledTimes(1);
      expect(mockSpendingAnalysisService.analyzePeriod).not.toHaveBeenCalled();
      expect(mockAnalysisRunRepository.save).not.toHaveBeenCalled();
    });

    it('should handle individual user failures and continue processing', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', email: 'user1@test.com' },
        { id: 'user-2', email: 'user2@test.com' },
      ];

      const mockAnalysisRun = {
        id: 'run-123',
        userId: 'user-1',
        status: AnalysisRunStatus.PROCESSING,
        markAsCompleted: jest.fn(),
      } as unknown as AnalysisRunModel;

      const mockAnalysisResult = {
        userId: 'user-2',
        period: {
          from: new Date('2025-11-11'),
          to: new Date('2025-11-25'),
        },
        totalSpendingUsd: 1000,
        categories: [],
      };

      (mockUserService.find as jest.Mock)
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([]);

      (mockAnalysisRunRepository.startOrSkip as jest.Mock).mockResolvedValue(
        mockAnalysisRun
      );

      // First user fails, second succeeds
      (mockSpendingAnalysisService.analyzePeriod as jest.Mock)
        .mockRejectedValueOnce(new Error('Analysis failed'))
        .mockResolvedValueOnce(mockAnalysisResult);

      (mockAnalysisRunRepository.save as jest.Mock).mockResolvedValue(
        mockAnalysisRun
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert
      expect(mockSpendingAnalysisService.analyzePeriod).toHaveBeenCalledTimes(
        2
      );
      // Only the second user should complete successfully
      expect(mockAnalysisRun.markAsCompleted).toHaveBeenCalledTimes(1);
      expect(mockAnalysisRunRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should break after max iterations to prevent infinite loops', async () => {
      // Arrange - simulate pagination bug where skip parameter is ignored
      // This mimics a real scenario where repository keeps returning the same records
      const mockUsers = [{ id: 'user-1', email: 'user1@test.com' }];

      // Mock always returns same user regardless of skip value (pagination broken)
      (mockUserService.find as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockUsers)
      );
      (mockAnalysisRunRepository.startOrSkip as jest.Mock).mockResolvedValue(
        null
      );

      // Act - should complete gracefully without hanging despite pagination bug
      await processor.process(mockJob as Job);

      // Assert - MAX_ITERATIONS safeguard prevented infinite loop
      expect(mockUserService.find).toHaveBeenCalledTimes(10000);

      // Verify skip was being incremented even though mock ignored it
      const firstCall = (mockUserService.find as jest.Mock).mock.calls[0][0];
      const lastCall = (mockUserService.find as jest.Mock).mock.calls[9999][0];
      expect(firstCall.skip).toBe(0);
      expect(lastCall.skip).toBe(1999800); // (9999 * 200)
    });

    it('should calculate rolling 14-day period correctly', async () => {
      // Arrange
      const mockUsers = [{ id: 'user-1', email: 'user1@test.com' }];

      const mockAnalysisRun = {
        id: 'run-123',
        userId: 'user-1',
        status: AnalysisRunStatus.PROCESSING,
        markAsCompleted: jest.fn(),
      } as unknown as AnalysisRunModel;

      const mockAnalysisResult = {
        userId: 'user-1',
        period: {
          from: new Date(),
          to: new Date(),
        },
        totalSpendingUsd: 1000,
        categories: [],
      };

      (mockUserService.find as jest.Mock)
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([]);

      (mockAnalysisRunRepository.startOrSkip as jest.Mock).mockResolvedValue(
        mockAnalysisRun
      );
      (
        mockSpendingAnalysisService.analyzePeriod as jest.Mock
      ).mockResolvedValue(mockAnalysisResult);
      (mockAnalysisRunRepository.save as jest.Mock).mockResolvedValue(
        mockAnalysisRun
      );

      // Act
      await processor.process(mockJob as Job);

      // Assert - check that analyzePeriod was called with dates
      const analyzePeriodCall = (
        mockSpendingAnalysisService.analyzePeriod as jest.Mock
      ).mock.calls[0];
      const dateFrom = analyzePeriodCall[1];
      const dateTo = analyzePeriodCall[2];

      expect(dateFrom).toBeInstanceOf(Date);
      expect(dateTo).toBeInstanceOf(Date);
      expect(dateTo.getTime() - dateFrom.getTime()).toBeGreaterThanOrEqual(
        14 * 24 * 60 * 60 * 1000
      ); // At least 14 days
    });

    it('should handle empty user list gracefully', async () => {
      // Arrange
      (mockUserService.find as jest.Mock).mockResolvedValue([]);

      // Act
      await processor.process(mockJob as Job);

      // Assert
      expect(mockUserService.find).toHaveBeenCalledTimes(1);
      expect(mockAnalysisRunRepository.startOrSkip).not.toHaveBeenCalled();
      expect(mockSpendingAnalysisService.analyzePeriod).not.toHaveBeenCalled();
    });

    it('should propagate critical errors', async () => {
      // Arrange
      const criticalError = new Error('Database connection lost');
      (mockUserService.find as jest.Mock).mockRejectedValue(criticalError);

      // Act & Assert
      await expect(processor.process(mockJob as Job)).rejects.toThrow(
        'Database connection lost'
      );
    });
  });
});
