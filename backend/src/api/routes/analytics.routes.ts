import express from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import {
  getExpensesOverTimeValidators,
  validateRequest,
} from '../middlewares/utils/validators';

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
router.get(
  '/expenses-over-time',
  getExpensesOverTimeValidators,
  validateRequest,
  analyticsController.getExpensesOverTime
);

/**
 * @swagger
 * /api/analytics/budgets:
 *   get:
 *     summary: Get budget allocations by category
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Optional user ID filter
 *     responses:
 *       200:
 *         description: Budget data retrieved successfully
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
 *                       category:
 *                         type: string
 *                       budgetAmount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/budgets', analyticsController.getBudgets);

/**
 * @swagger
 * /api/analytics/budget-vs-expenses:
 *   get:
 *     summary: Get budget vs expense comparison by category
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Budget vs expense comparison data retrieved successfully
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
 *                       category:
 *                         type: string
 *                       budgetAmount:
 *                         type: number
 *                       expenseAmount:
 *                         type: number
 *                       utilizationPercentage:
 *                         type: number
 *                       remaining:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [UNDER_BUDGET, OVER_BUDGET, ON_BUDGET, NO_BUDGET]
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/budget-vs-expenses', analyticsController.getBudgetVsExpenses);

export default router;
