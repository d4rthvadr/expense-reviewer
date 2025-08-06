import express from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = express.Router();

/**
 * @swagger
 * /api/analytics/expenses-over-time:
 *   get:
 *     summary: Get expense analytics over time
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (ISO format)
 *       - in: query
 *         name: dateTo
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (ISO format)
 *       - in: query
 *         name: groupBy
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Time period grouping
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Optional user ID filter
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *                       expenseCount:
 *                         type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/expenses-over-time', analyticsController.getExpensesOverTime);

export default router;
