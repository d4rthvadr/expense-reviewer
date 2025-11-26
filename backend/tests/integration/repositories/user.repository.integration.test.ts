import { userRepository } from '@domain/repositories/user.repository';
import { Database } from '@infra/db/database';
import { UserFactory } from '@domain/factories/user.factory';
import { AnalysisRunStatus } from '@domain/repositories/analysis-run.repository';

describe('UserRepository Integration Tests', () => {
  const db = new Database();
  const testUserId1 = 'test-user-1-' + Date.now();
  const testUserId2 = 'test-user-2-' + Date.now();
  const testUserId3 = 'test-user-3-' + Date.now();

  const periodStart = new Date('2025-11-01T00:00:00.000Z');
  const periodEnd = new Date('2025-11-15T23:59:59.999Z');

  beforeAll(async () => {
    // Create test users
    const user1 = UserFactory.createUser({
      name: 'Test User 1',
      email: `test1-${Date.now()}@example.com`,
      password: 'password123',
    });
    user1.id = testUserId1;

    const user2 = UserFactory.createUser({
      name: 'Test User 2',
      email: `test2-${Date.now()}@example.com`,
      password: 'password123',
    });
    user2.id = testUserId2;

    const user3 = UserFactory.createUser({
      name: 'Test User 3',
      email: `test3-${Date.now()}@example.com`,
      password: 'password123',
    });
    user3.id = testUserId3;

    await userRepository.save(user1);
    await userRepository.save(user2);
    await userRepository.save(user3);

    // Create analysis runs with different statuses
    // User 1: COMPLETED (should not be returned)
    await db.analysisRun.create({
      data: {
        userId: testUserId1,
        periodStart,
        periodEnd,
        status: AnalysisRunStatus.COMPLETED,
        attemptCount: 1,
      },
    });

    // User 2: FAILED (should be returned for retry)
    await db.analysisRun.create({
      data: {
        userId: testUserId2,
        periodStart,
        periodEnd,
        status: AnalysisRunStatus.FAILED,
        attemptCount: 2,
        lastError: 'Test error',
      },
    });

    // User 3: No analysis run (should be returned)
  });

  afterAll(async () => {
    // Cleanup test data
    await db.analysisRun.deleteMany({
      where: {
        userId: { in: [testUserId1, testUserId2, testUserId3] },
      },
    });

    await db.user.deleteMany({
      where: {
        id: { in: [testUserId1, testUserId2, testUserId3] },
      },
    });

    await db.$disconnect();
  });

  describe('findUnprocessedForPeriod', () => {
    it('should return only users with no analysis run or PENDING/FAILED status', async () => {
      // Act
      const unprocessedUsers = await userRepository.findUnprocessedForPeriod(
        periodStart,
        periodEnd,
        { take: 10, skip: 0 }
      );

      // Assert
      const unprocessedUserIds = unprocessedUsers.map((user) => user.id);

      // Should include user 2 (FAILED) and user 3 (no run)
      expect(unprocessedUserIds).toContain(testUserId2);
      expect(unprocessedUserIds).toContain(testUserId3);

      // Should NOT include user 1 (COMPLETED)
      expect(unprocessedUserIds).not.toContain(testUserId1);

      // Should have at least 2 users (might have more from other tests)
      expect(unprocessedUsers.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect pagination parameters', async () => {
      // Act - fetch first page
      const firstPage = await userRepository.findUnprocessedForPeriod(
        periodStart,
        periodEnd,
        { take: 1, skip: 0 }
      );

      // Act - fetch second page
      const secondPage = await userRepository.findUnprocessedForPeriod(
        periodStart,
        periodEnd,
        { take: 1, skip: 1 }
      );

      // Assert
      expect(firstPage.length).toBeLessThanOrEqual(1);
      expect(secondPage.length).toBeLessThanOrEqual(1);

      // If both have results, they should be different users
      if (firstPage.length > 0 && secondPage.length > 0) {
        expect(firstPage[0].id).not.toBe(secondPage[0].id);
      }
    });

    it('should return empty array when all users are COMPLETED for the period', async () => {
      // Arrange - create a new period where all test users are completed
      const newPeriodStart = new Date('2025-12-01T00:00:00.000Z');
      const newPeriodEnd = new Date('2025-12-15T23:59:59.999Z');

      await db.analysisRun.create({
        data: {
          userId: testUserId1,
          periodStart: newPeriodStart,
          periodEnd: newPeriodEnd,
          status: AnalysisRunStatus.COMPLETED,
          attemptCount: 1,
        },
      });

      await db.analysisRun.create({
        data: {
          userId: testUserId2,
          periodStart: newPeriodStart,
          periodEnd: newPeriodEnd,
          status: AnalysisRunStatus.COMPLETED,
          attemptCount: 1,
        },
      });

      await db.analysisRun.create({
        data: {
          userId: testUserId3,
          periodStart: newPeriodStart,
          periodEnd: newPeriodEnd,
          status: AnalysisRunStatus.COMPLETED,
          attemptCount: 1,
        },
      });

      // Act
      const unprocessedUsers = await userRepository.findUnprocessedForPeriod(
        newPeriodStart,
        newPeriodEnd,
        { take: 100, skip: 0 }
      );

      // Assert - none of our test users should be returned
      const unprocessedUserIds = unprocessedUsers.map((user) => user.id);
      expect(unprocessedUserIds).not.toContain(testUserId1);
      expect(unprocessedUserIds).not.toContain(testUserId2);
      expect(unprocessedUserIds).not.toContain(testUserId3);

      // Cleanup
      await db.analysisRun.deleteMany({
        where: {
          periodStart: newPeriodStart,
          periodEnd: newPeriodEnd,
          userId: { in: [testUserId1, testUserId2, testUserId3] },
        },
      });
    });
  });
});
