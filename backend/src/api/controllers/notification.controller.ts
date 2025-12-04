import { log } from '@infra/logger';
import {
  notificationService,
  NotificationService,
} from '../../domain/services/notification.service';
import { Request, Response } from 'express';
import { NotificationFiltersRequestDto } from './dtos/request/notification-filters-request.dto';
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

    return res.status(200).json(notifications);
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
      await this.#notificationService.acknowledgeNotification(userId, id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json(notification);
  };

  /**
   * Mark all notifications as read for the authenticated user
   */
  markAllAsRead = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    log.info(`Marking all notifications as read for userId: ${userId}`);

    const count = await this.#notificationService.markAllAsRead(userId);

    return res.status(200).json({ success: true, count });
  };
}

export const notificationController = new NotificationController(
  notificationService
);
