import { log } from '@infra/logger';
import {
  NotificationRepository,
  notificationRepository,
  NotificationFilters,
} from '@domain/repositories/notification.repository';
import { NotificationModel } from '@domain/models/notification.model';
import {
  NotificationFactory,
  NotificationCreateDataDto,
} from '@domain/factories/notification.factory';
import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';
import { Category } from '@domain/enum/category.enum';

export interface CategoryThresholdNotificationData {
  userId: string;
  category: Category;
  severity: NotificationSeverity;
  weight: number;
  actualShare: number;
  deltaPct: number;
  period?: string; // e.g., '2024-11' for monthly dedupe
}

export interface NotificationListOptions extends NotificationFilters {
  includeRead?: boolean;
}

export class NotificationService {
  #repository: NotificationRepository;

  constructor(repository: NotificationRepository) {
    this.#repository = repository;
  }

  /**
   * Generic method to publish a notification with optional dedupe
   */
  async publish(data: NotificationCreateDataDto): Promise<NotificationModel> {
    try {
      // Check for existing notification if dedupe key provided
      if (data.dedupeKey) {
        const existing = await this.#repository.findByDedupeKey(data.dedupeKey);
        if (existing) {
          log.info(
            `Skipped duplicate notification with dedupe key: ${data.dedupeKey}`
          );
          return existing;
        }
      }

      // Create notification model using factory
      const notification = NotificationFactory.createNotification(data);

      // Persist to repository
      return await this.#repository.create(notification);
    } catch (error) {
      log.error({
        message: `Error publishing notification for user: ${data.userId}`,
        error,
        code: 'PUBLISH_NOTIFICATION_ERROR',
      });
      throw error;
    }
  }

  /**
   * Specialized method for category threshold breach notifications
   */
  async notifyCategoryThresholdBreach(
    data: CategoryThresholdNotificationData
  ): Promise<NotificationModel> {
    const {
      userId,
      category,
      severity,
      weight,
      actualShare,
      deltaPct,
      period,
    } = data;

    try {
      log.info(
        `Creating category threshold notification for user ${userId}, category ${category}`
      );

      const title = this.#generateThresholdTitle(category, severity);
      const message = this.#generateThresholdMessage(
        category,
        weight,
        actualShare,
        deltaPct
      );

      const meta = {
        category,
        weight,
        actualShare,
        deltaPct,
        threshold: weight,
        period: period || new Date().toISOString().substring(0, 7), // YYYY-MM
      };

      // Create dedupe key to prevent duplicate notifications
      const dedupeKey = NotificationModel.createDedupeKey(
        NotificationType.CATEGORY_THRESHOLD,
        severity,
        NotificationResourceType.CATEGORY,
        category,
        period || new Date().toISOString().substring(0, 7)
      );

      return await this.publish({
        userId,
        type: NotificationType.CATEGORY_THRESHOLD,
        severity,
        resourceType: NotificationResourceType.CATEGORY,
        resourceId: category,
        title,
        message,
        meta,
        dedupeKey,
      });
    } catch (error) {
      log.error({
        message: `Error creating category threshold notification for user: ${userId}`,
        error,
        code: 'CATEGORY_THRESHOLD_NOTIFICATION_ERROR',
      });
      throw error;
    }
  }

  /**
   * List notifications for a user with optional filters
   */
  async listUserNotifications(
    userId: string,
    options: NotificationListOptions = {}
  ): Promise<NotificationModel[]> {
    const { includeRead = true, ...filters } = options;

    return await this.#repository.listForUser(userId, {
      ...filters,
      unreadOnly: !includeRead,
    });
  }

  /**
   * Mark a notification as read (with user ownership check)
   */
  async acknowledgeNotification(
    userId: string,
    notificationId: string
  ): Promise<NotificationModel | null> {
    try {
      // First verify the notification belongs to the user
      const notification = await this.#repository.findById(notificationId);
      if (!notification || notification.userId !== userId) {
        log.warn(
          `User ${userId} attempted to acknowledge notification ${notificationId} they don't own`
        );
        return null;
      }

      if (notification.isRead) {
        return notification; // Already read
      }

      return await this.#repository.markAsRead(notificationId);
    } catch (error) {
      log.error({
        message: `Error acknowledging notification ${notificationId} for user: ${userId}`,
        error,
        code: 'ACKNOWLEDGE_NOTIFICATION_ERROR',
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async acknowledgeAllNotifications(userId: string): Promise<number> {
    try {
      return await this.#repository.markAllAsRead(userId);
    } catch (error) {
      log.error({
        message: `Error acknowledging all notifications for user: ${userId}`,
        error,
        code: 'ACKNOWLEDGE_ALL_NOTIFICATIONS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.#repository.getUnreadCount(userId);
    } catch (error) {
      log.error({
        message: `Error getting unread count for user: ${userId}`,
        error,
        code: 'GET_UNREAD_COUNT_ERROR',
      });
      throw error;
    }
  }

  /**
   * Delete a notification (with user ownership check)
   */
  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    try {
      // Verify ownership
      const notification = await this.#repository.findById(notificationId);
      if (!notification || notification.userId !== userId) {
        log.warn(
          `User ${userId} attempted to delete notification ${notificationId} they don't own`
        );
        return false;
      }

      return await this.#repository.delete(notificationId);
    } catch (error) {
      log.error({
        message: `Error deleting notification ${notificationId} for user: ${userId}`,
        error,
        code: 'DELETE_NOTIFICATION_ERROR',
      });
      throw error;
    }
  }

  /**
   * Generate notification title for category threshold breach
   */
  #generateThresholdTitle(
    category: Category,
    severity: NotificationSeverity
  ): string {
    const categoryName = category.toLowerCase().replace(/_/g, ' ');
    const severityPrefix =
      severity === NotificationSeverity.CRITICAL ? '🚨' : '⚠️';

    return `${severityPrefix} ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} spending alert`;
  }

  /**
   * Generate notification message for category threshold breach
   */
  #generateThresholdMessage(
    category: Category,
    weight: number,
    actualShare: number,
    deltaPct: number
  ): string {
    const categoryName = category.toLowerCase().replace(/_/g, ' ');
    const weightPct = Math.round(weight * 100);
    const actualPct = Math.round(actualShare * 100);
    const overagePct = Math.round(deltaPct);

    return `Your ${categoryName} spending is ${actualPct}% of your total spending, which is ${overagePct}% over your target of ${weightPct}%. Consider reviewing your ${categoryName} expenses to stay within your budget allocation.`;
  }
}

export const notificationService = new NotificationService(
  notificationRepository
);
