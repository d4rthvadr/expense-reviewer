import express from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import {
  validateRequest,
  getBudgetVsTransactionsValidators,
  getTransactionsOverTimeValidators,
} from '@api/middlewares/utils/validators/';
import { asyncHandler } from './utils/async-handler';

const router = express.Router();

/**
 * @swagger
 * /api/analytics/transactions-over-time:
 *   get:
 *     summary: Get transaction analytics over time
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
  '/transactions-over-time',
  getTransactionsOverTimeValidators,
  validateRequest,
  analyticsController.getTransactionsOverTime
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
 * /api/analytics/budget-vs-transactions:
 *   get:
 *     summary: Get budget vs expense comparison by category with currency conversion
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
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Optional user ID to get amounts in user's preferred currency
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
 *                         description: Budget amount in user's preferred currency
 *                       expenseAmount:
 *                         type: number
 *                         description: Expense amount in user's preferred currency
 *                       currency:
 *                         type: string
 *                         enum: [USD, EUR, GHS]
 *                         description: Currency of the amounts (user's preferred currency)
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
router.get(
  '/budget-vs-transactions',
  getBudgetVsTransactionsValidators,
  validateRequest,
  analyticsController.getBudgetVsTransactions
);

/**
 * @swagger
 * /api/analytics/expenses-vs-income:
 *   get:
 *     summary: Get expenses vs income analytics over time
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (ISO format). Defaults to current month start if not provided.
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (ISO format). Defaults to current month end if not provided.
 *       - in: query
 *         name: groupBy
 *         required: true
 *         schema:
 *           type: string
 *           enum: [week, month]
 *         description: Time period grouping for line chart data
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Target currency for conversion (defaults to user's primary currency)
 *     responses:
 *       200:
 *         description: Expenses vs income analytics retrieved successfully
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
 *                         description: Period date in YYYY-MM-DD format
 *                       periodLabel:
 *                         type: string
 *                         description: Human-readable period label
 *                       cumulativeExpenses:
 *                         type: number
 *                         description: Running total of expenses from start date
 *                       cumulativeIncome:
 *                         type: number
 *                         description: Running total of income from start date
 *                       cumulativeNet:
 *                         type: number
 *                         description: Running total of net (income - expenses)
 *                       periodExpenses:
 *                         type: number
 *                         description: Expenses for this period only
 *                       periodIncome:
 *                         type: number
 *                         description: Income for this period only
 *                       periodNet:
 *                         type: number
 *                         description: Net amount for this period only
 *                 meta:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                     period:
 *                       type: object
 *                       properties:
 *                         from:
 *                           type: string
 *                         to:
 *                           type: string
 *                     groupBy:
 *                       type: string
 *                     totalExpenses:
 *                       type: number
 *                     totalIncome:
 *                       type: number
 *                     totalNet:
 *                       type: number
 *                     totalExpenseCount:
 *                       type: number
 *                     totalIncomeCount:
 *                       type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get(
  '/expenses-vs-income',
  asyncHandler(analyticsController.getExpensesVsIncome)
);

export default router;
