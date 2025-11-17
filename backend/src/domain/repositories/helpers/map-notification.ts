/* eslint-disable no-unused-vars */

import { NotificationModel } from '@domain/models/notification.model';
import { Notification as NotificationEntity } from '../../../../generated/prisma';
import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';

// Overloads for mapNotification
export function mapNotification(entity: NotificationEntity): NotificationModel;
export function mapNotification(entity: null): null;
export function mapNotification(
  entity: NotificationEntity | null
): NotificationModel | null;
export function mapNotification(
  entity: NotificationEntity | null
): NotificationModel | null {
  if (!entity) {
    return null;
  }

  return new NotificationModel({
    id: entity.id,
    userId: entity.userId,
    type: entity.type as NotificationType,
    severity: entity.severity as NotificationSeverity,
    resourceType: entity.resourceType as NotificationResourceType,
    resourceId: entity.resourceId,
    title: entity.title,
    message: entity.message,
    meta: entity.meta as Record<string, unknown> | null,
    isRead: entity.isRead,
    dedupeKey: entity.dedupeKey,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
