import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';
import { NotificationModel } from '@domain/models/notification.model';
import { JSONValue } from '@domain/types/json';

export interface NotificationCreateDataDto {
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  resourceType: NotificationResourceType;
  resourceId: string;
  title: string;
  message: string;
  meta?: Record<string, unknown> | null;
  dedupeKey?: string | null;
}

export class NotificationFactory {
  /**
   * Creates a new NotificationModel instance from the provided data.
   * @param data - The data to create the notification model.
   * @returns A new NotificationModel instance.
   */
  static createNotification(
    data: NotificationCreateDataDto
  ): NotificationModel {
    const {
      userId,
      type,
      severity,
      resourceType,
      resourceId,
      title,
      message,
      meta,
      dedupeKey,
    } = data;

    return new NotificationModel({
      userId,
      type,
      severity,
      resourceType,
      resourceId,
      title,
      message,
      meta: meta as JSONValue,
      dedupeKey,
    });
  }
}
