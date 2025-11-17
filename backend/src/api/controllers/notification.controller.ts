import { log } from '@infra/logger';
import {
  notificationService,
  NotificationService,
} from '../../domain/services/notification.service';
import { Request, Response } from 'express';
import { CreateNotificationRequestDto } from './dtos/request/create-notification-request.dto';
import { NotificationFiltersRequestDto } from './dtos/request/notification-filters-request.dto';
import { NotificationResponseDto } from './dtos/response/notification-response.dto';
import { RequestBodyType } from '../types/request-body.type';
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
   * Create a new notification
   */
  create = async (
    req: RequestBodyType<CreateNotificationRequestDto>,
    res: Response
  ) => {
    log.info(
      `Creating notification with data: ${JSON.stringify({
        type: req.body.type,
        severity: req.body.severity,
        resourceType: req.body.resourceType,
        resourceId: req.body.resourceId,
        title: req.body.title,
      })}`
    );

    // Extract userId from request context (set by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await this.#notificationService.publish({
      ...req.body,
      userId,
    });

    return res.status(201).json(this.#toNotificationResponseDto(notification));
  };

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
   * Mark all notifications as read for the user
   */
  acknowledgeAll = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    log.info(`Acknowledging all notifications for userId: ${userId}`);

    const count =
      await this.#notificationService.acknowledgeAllNotifications(userId);

    return res.status(200).json({ acknowledgedCount: count });
  };

  /**
   * Delete a notification
   */
  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    log.info(`Deleting notification ${id} for userId: ${userId}`);

    await this.#notificationService.deleteNotification(id, userId);

    return res.status(204).send();
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
      meta: notification.meta,
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
