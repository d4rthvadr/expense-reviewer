import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';

export interface CreateNotificationRequestDto {
  type: NotificationType;
  severity: NotificationSeverity;
  resourceType: NotificationResourceType;
  resourceId: string;
  title: string;
  message: string;
  meta?: Record<string, unknown>;
}
