import { body, query } from 'express-validator';
import { NotificationType } from '@domain/enum/notification-type.enum';
import { NotificationSeverity } from '@domain/enum/notification-severity.enum';
import { NotificationResourceType } from '@domain/enum/notification-resource-type.enum';

export const createNotificationRequestValidator = [
  body('type')
    .notEmpty()
    .isIn(Object.values(NotificationType))
    .withMessage(
      `Type must be a valid notification type. (${Object.values(NotificationType).join(', ')})`
    ),
  body('severity')
    .notEmpty()
    .isIn(Object.values(NotificationSeverity))
    .withMessage(
      `Severity must be a valid notification severity. (${Object.values(NotificationSeverity).join(', ')})`
    ),
  body('resourceType')
    .notEmpty()
    .isIn(Object.values(NotificationResourceType))
    .withMessage(
      `Resource type must be a valid resource type. (${Object.values(NotificationResourceType).join(', ')})`
    ),
  body('resourceId')
    .trim()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage('Resource ID is required'),
  body('title')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be between 1 and 255 characters'),
  body('message')
    .trim()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage('Message is required'),
  body('meta').optional().isObject().withMessage('Meta must be a valid object'),
];

export const notificationFiltersQueryValidator = [
  query('unreadOnly')
    .optional()
    .isBoolean()
    .withMessage('unreadOnly must be a boolean'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query('cursor').optional().isString().withMessage('cursor must be a string'),
  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage(
      `Type must be a valid notification type. (${Object.values(NotificationType).join(', ')})`
    ),
  query('severity')
    .optional()
    .isIn(Object.values(NotificationSeverity))
    .withMessage(
      `Severity must be a valid notification severity. (${Object.values(NotificationSeverity).join(', ')})`
    ),
  query('resourceType')
    .optional()
    .isIn(Object.values(NotificationResourceType))
    .withMessage(
      `Resource type must be a valid resource type. (${Object.values(NotificationResourceType).join(', ')})`
    ),
];
