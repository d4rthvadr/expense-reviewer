import { log } from '@infra/logger';
import {
  notificationService,
  NotificationService,
} from '../../domain/services/notification.service';
import { Request, Response } from 'express';
import { NotificationFiltersRequestDto } from './dtos/request/notification-filters-request.dto';
import { NotificationResponseDto } from './dtos/response/notification-response.dto';
import { NotificationModel } from '@domain/models/notification.model';
import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';

export class NotificationController {
  #notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.#notificationService = notificationService;
  }

  /**
   * List notifications for the authenticated user
   */
  list = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const filters: NotificationFiltersRequestDto = {
      unreadOnly: req.query.unreadOnly === 'true',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      cursor: req.query.cursor as string,
      type: req.query.type as NotificationType,
      severity: req.query.severity as NotificationSeverity,
      resourceType: req.query.resourceType as NotificationResourceType,
    };

    log.info(
      `Listing notifications for userId: ${userId} with filters: ${JSON.stringify(filters)}`
    );

    const notifications = await this.#notificationService.listUserNotifications(
      userId,
      filters
    );

    return res
      .status(200)
      .json(
        notifications.map((notification) =>
          this.#toNotificationResponseDto(notification)
        )
      );
  };

  /**
   * Get unread notifications count
   */
  getUnreadCount = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    log.info(`Getting unread count for userId: ${userId}`);
    const count = await this.#notificationService.getUnreadCount(userId);

    return res.status(200).json({ count });
  };

  /**
   * Mark a notification as read
   */
  acknowledge = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    log.info(`Acknowledging notification ${id} for userId: ${userId}`);

    const notification =
      await this.#notificationService.acknowledgeNotification(id, userId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json(this.#toNotificationResponseDto(notification));
  };

  /**
   * Convert NotificationModel to NotificationResponseDto
   */
  #toNotificationResponseDto(
    notification: NotificationModel
  ): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      severity: notification.severity,
      resourceType: notification.resourceType,
      resourceId: notification.resourceId,
      title: notification.title,
      message: notification.message,
      meta: notification.meta as Record<string, unknown> | undefined,
      isRead: notification.isRead,
      dedupeKey: notification.dedupeKey,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}

export const notificationController = new NotificationController(
  notificationService
);
