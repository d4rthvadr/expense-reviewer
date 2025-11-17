/**
 * Notification type enumeration
 * Defines the various types of notifications that can be sent to users
 */
export enum NotificationType {
  CATEGORY_THRESHOLD = 'CATEGORY_THRESHOLD',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  TRANSACTION_FLAGGED = 'TRANSACTION_FLAGGED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  SYSTEM = 'SYSTEM',
}
