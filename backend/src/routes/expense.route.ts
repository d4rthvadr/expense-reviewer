import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import {
  paginationQueryParamsValidators,
  validateRequest,
  updateExpenseValidators,
  createExpenseValidators,
} from '@middlewares/utils/validators/';
import { expenseController } from '@controllers/expense.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the expense
 *               type:
 *                 type: string
 *                 description: Type of the expense
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     qty:
 *                       type: number
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Retrieve all expenses
 *     responses:
 *       200:
 *         description: A list of expenses
 * /api/expenses/{expenseId}:
 *   get:
 *     summary: Retrieve a specific expense by ID
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the expense
 *     responses:
 *       200:
 *         description: Expense details
 *       404:
 *         description: Expense not found
 *   put:
 *     summary: Update an expense by ID
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the expense
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     qty:
 *                       type: number
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Expense not found
 *   delete:
 *     summary: Delete an expense by ID
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the expense
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */

// /api/expenses
route.post(
  '/',
  createExpenseValidators,
  validateRequest,
  asyncHandler(expenseController.create)
);

// /api/expenses/:id
route.get('/:expenseId', asyncHandler(expenseController.findOne));

// /api/expenses
route.get(
  '/',
  paginationQueryParamsValidators,
  validateRequest,
  asyncHandler(expenseController.find)
);

// /api/expenses/:id
route.put(
  '/:expenseId',
  updateExpenseValidators,
  validateRequest,
  asyncHandler(expenseController.update)
);

// /api/expenses/:id
route.delete('/:expenseId', asyncHandler(expenseController.delete));

export default route;
