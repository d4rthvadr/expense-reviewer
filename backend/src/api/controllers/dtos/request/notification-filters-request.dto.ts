import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';

export interface NotificationFiltersRequestDto {
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
  type?: NotificationType;
  severity?: NotificationSeverity;
  resourceType?: NotificationResourceType;
}
