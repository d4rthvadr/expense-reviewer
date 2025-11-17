import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { validateRequest } from '@api/middlewares/utils/validators';
import {
  createNotificationRequestValidator,
  notificationFiltersQueryValidator,
} from '@api/middlewares/utils/validators/notification-request.validator';
import { notificationController } from '@api/controllers/notification.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CATEGORY_THRESHOLD, BUDGET_EXCEEDED, TRANSACTION_FLAGGED, REVIEW_REQUIRED, SYSTEM]
 *                 description: Type of notification
 *               severity:
 *                 type: string
 *                 enum: [INFO, WARNING, CRITICAL]
 *                 description: Severity level of the notification
 *               resourceType:
 *                 type: string
 *                 enum: [CATEGORY, TRANSACTION, BUDGET, REVIEW, SYSTEM]
 *                 description: Type of resource the notification relates to
 *               resourceId:
 *                 type: string
 *                 description: ID of the related resource
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               meta:
 *                 type: object
 *                 description: Additional metadata (optional)
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 title:
 *                   type: string
 *                 message:
 *                   type: string
 *                 isRead:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: User not authenticated
 *   get:
 *     summary: List notifications for the authenticated user
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter to unread notifications only
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of notifications to return
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CATEGORY_THRESHOLD, BUDGET_EXCEEDED, TRANSACTION_FLAGGED, REVIEW_REQUIRED, SYSTEM]
 *         description: Filter by notification type
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [INFO, WARNING, CRITICAL]
 *         description: Filter by severity
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [CATEGORY, TRANSACTION, BUDGET, REVIEW, SYSTEM]
 *         description: Filter by resource type
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   title:
 *                     type: string
 *                   message:
 *                     type: string
 *                   isRead:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: User not authenticated
 */
route.post(
  '/',
  createNotificationRequestValidator,
  validateRequest,
  asyncHandler(notificationController.create)
);

route.get(
  '/',
  notificationFiltersQueryValidator,
  validateRequest,
  asyncHandler(notificationController.list)
);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: User not authenticated
 */
route.get('/unread-count', asyncHandler(notificationController.getUnreadCount));

/**
 * @swagger
 * /api/notifications/acknowledge-all:
 *   post:
 *     summary: Mark all notifications as read for the authenticated user
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledgedCount:
 *                   type: integer
 *       401:
 *         description: User not authenticated
 */
route.post(
  '/acknowledge-all',
  asyncHandler(notificationController.acknowledgeAll)
);

/**
 * @swagger
 * /api/notifications/{id}/acknowledge:
 *   post:
 *     summary: Mark a specific notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 isRead:
 *                   type: boolean
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Notification not found
 */
route.post(
  '/:id/acknowledge',
  asyncHandler(notificationController.acknowledge)
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a specific notification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       204:
 *         description: Notification deleted successfully
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Notification not found
 */
route.delete('/:id', asyncHandler(notificationController.delete));

export default route;
