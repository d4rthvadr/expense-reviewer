import { log } from '@infra/logger';
import { Database } from '@infra/db/database';
import { NotificationModel } from '@domain/models/notification.model';
import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';
import { mapNotification } from './helpers/map-notification';

export interface NotificationFilters {
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string; // createdAt ISO string for pagination
  type?: NotificationType;
  severity?: NotificationSeverity;
  resourceType?: NotificationResourceType;
}

export class NotificationRepository extends Database {
  /**
   * Create a new notification
   */
  async create(data: NotificationModel): Promise<NotificationModel> {
    try {
      const notification = await this.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          severity: data.severity,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          title: data.title,
          message: data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: data.meta as any,
          dedupeKey: data.dedupeKey,
        },
      });

      log.info(
        `Created notification ${notification.id} for user ${data.userId}`
      );
      return mapNotification(notification);
    } catch (error) {
      log.error({
        message: `Error creating notification for userId: ${data.userId}`,
        error,
        code: 'CREATE_NOTIFICATION_ERROR',
      });
      throw error;
    }
  }

  /**
   * Find notification by ID
   */
  async findById(id: string): Promise<NotificationModel | null> {
    try {
      const notification = await this.notification.findUnique({
        where: { id },
      });

      return mapNotification(notification);
    } catch (error) {
      log.error({
        message: `Error fetching notification by id: ${id}`,
        error,
        code: 'FIND_NOTIFICATION_ERROR',
      });
      throw error;
    }
  }

  /**
   * Find notification by dedupe key
   */
  async findByDedupeKey(dedupeKey: string): Promise<NotificationModel | null> {
    try {
      const notification = await this.notification.findUnique({
        where: { dedupeKey },
      });

      return mapNotification(notification);
    } catch (error) {
      log.error({
        message: `Error fetching notification by dedupe key: ${dedupeKey}`,
        error,
        code: 'FIND_NOTIFICATION_BY_DEDUPE_KEY_ERROR',
      });
      throw error;
    }
  }

  /**
   * List notifications for a user with filters and pagination
   */
  async listForUser(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<NotificationModel[]> {
    try {
      const {
        unreadOnly = false,
        limit = 20,
        cursor,
        type,
        severity,
        resourceType,
      } = filters;

      const where = {
        userId,
        ...(unreadOnly && { isRead: false }),
        type,
        severity,
        resourceType,
      };

      const notifications = await this.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1, // Skip the cursor itself
        }),
      });

      log.info(
        `Retrieved ${notifications.length} notifications for userId: ${userId}`
      );

      return notifications.map((notification) => mapNotification(notification));
    } catch (error) {
      log.error({
        message: `Error listing notifications for userId: ${userId}`,
        error,
        code: 'LIST_NOTIFICATIONS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<NotificationModel | null> {
    try {
      const notification = await this.notification.update({
        where: { id },
        data: { isRead: true },
      });

      log.info(`Marked notification ${id} as read`);
      return mapNotification(notification);
    } catch (error) {
      log.error({
        message: `Error marking notification as read: ${id}`,
        error,
        code: 'MARK_NOTIFICATION_READ_ERROR',
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      log.info(
        `Marked ${result.count} notifications as read for userId: ${userId}`
      );
      return result.count;
    } catch (error) {
      log.error({
        message: `Error marking all notifications as read for userId: ${userId}`,
        error,
        code: 'MARK_ALL_NOTIFICATIONS_READ_ERROR',
      });
      throw error;
    }
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.notification.count({
        where: { userId, isRead: false },
      });

      return count;
    } catch (error) {
      log.error({
        message: `Error getting unread count for userId: ${userId}`,
        error,
        code: 'GET_UNREAD_COUNT_ERROR',
      });
      throw error;
    }
  }
}

export const notificationRepository = new NotificationRepository();
