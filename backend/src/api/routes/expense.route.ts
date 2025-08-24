import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import {
  paginationQueryParamsValidators,
  validateRequest,
  updateExpenseValidators,
  createExpenseValidators,
} from '@api/middlewares/utils/validators/';
import { expenseController } from '@api/controllers/expense.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     description: Creates a new expense for the authenticated user. The expense amount is automatically converted to USD for tracking purposes.
 *     tags:
 *       - Expenses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpenseRequest'
 *           examples:
 *             grocery_expense:
 *               summary: Grocery shopping expense
 *               value:
 *                 name: "Weekly Groceries"
 *                 amount: 85.50
 *                 category: "FOOD"
 *                 currency: "USD"
 *                 qty: 1
 *                 description: "Weekly grocery shopping at local market"
 *             transport_expense:
 *               summary: Transportation expense
 *               value:
 *                 name: "Bus Fare"
 *                 amount: 12.00
 *                 category: "TRANSPORT"
 *                 currency: "USD"
 *                 qty: 2
 *                 description: "Round trip bus fare"
 *             custom_date_expense:
 *               summary: Expense with custom date
 *               value:
 *                 name: "Restaurant Dinner"
 *                 amount: 45.00
 *                 category: "FOOD"
 *                 currency: "USD"
 *                 description: "Dinner at Italian restaurant"
 *                 createdAt: "2024-08-20T19:30:00Z"
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *             example:
 *               id: "expense_123"
 *               name: "Weekly Groceries"
 *               description: "Weekly grocery shopping at local market"
 *               qty: 1
 *               category: "FOOD"
 *               userId: "user_456"
 *               amount: 85.50
 *               amountUsd: 85.50
 *               currency: "USD"
 *               createdAt: "2024-08-24T10:00:00Z"
 *               updatedAt: "2024-08-24T10:00:00Z"
 *               expenseReviewId: null
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missing_required_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "name"
 *                       message: "Name is required"
 *                     - field: "amount"
 *                       message: "Amount is required"
 *                     - field: "category"
 *                       message: "Category is required"
 *               invalid_category:
 *                 summary: Invalid category
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "category"
 *                       message: "Category must be a valid category (FOOD, TRANSPORT, UTILITIES, ...)"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required. Please provide a valid token."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 *   get:
 *     summary: Get a list of expenses
 *     description: Retrieves a paginated list of expenses for the authenticated user. Supports pagination and filtering.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of expenses per page
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, EDUCATION, SHOPPING, MISCELLANEOUS, PERSONAL_AND_LIFESTYLE, TRAVEL, GIFTS_OR_DONATIONS, HOUSING, SAVINGS_OR_INVESTMENTS, INSURANCE, OTHER]
 *         description: Filter expenses by category
 *         example: FOOD
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses from this date
 *         example: "2024-08-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses up to this date
 *         example: "2024-08-31"
 *     responses:
 *       200:
 *         description: List of expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseListResponse'
 *             examples:
 *               with_expenses:
 *                 summary: Response with expense data
 *                 value:
 *                   data:
 *                     - id: "expense_123"
 *                       name: "Weekly Groceries"
 *                       description: "Weekly grocery shopping"
 *                       qty: 1
 *                       category: "FOOD"
 *                       userId: "user_456"
 *                       amount: 85.50
 *                       amountUsd: 85.50
 *                       currency: "USD"
 *                       createdAt: "2024-08-24T10:00:00Z"
 *                       updatedAt: "2024-08-24T10:00:00Z"
 *                       expenseReviewId: null
 *                     - id: "expense_789"
 *                       name: "Bus Fare"
 *                       description: "Daily commute"
 *                       qty: 2
 *                       category: "TRANSPORT"
 *                       userId: "user_456"
 *                       amount: 12.00
 *                       amountUsd: 12.00
 *                       currency: "USD"
 *                       createdAt: "2024-08-24T09:00:00Z"
 *                       updatedAt: "2024-08-24T09:00:00Z"
 *                       expenseReviewId: null
 *                   pagination:
 *                     total: 45
 *                     page: 1
 *                     limit: 10
 *                     totalPages: 5
 *               empty_response:
 *                 summary: Empty response
 *                 value:
 *                   data: []
 *                   pagination:
 *                     total: 0
 *                     page: 1
 *                     limit: 10
 *                     totalPages: 0
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               message: "Validation failed"
 *               errors:
 *                 - field: "page"
 *                   message: "Page must be a positive integer"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required. Please provide a valid token."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 * /api/expenses/{expenseId}:
 *   get:
 *     summary: Get a specific expense by ID
 *     description: Retrieves detailed information about a specific expense belonging to the authenticated user.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the expense
 *         example: "expense_123"
 *     responses:
 *       200:
 *         description: Expense details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *             example:
 *               id: "expense_123"
 *               name: "Weekly Groceries"
 *               description: "Weekly grocery shopping at local market"
 *               qty: 1
 *               category: "FOOD"
 *               userId: "user_456"
 *               amount: 85.50
 *               amountUsd: 85.50
 *               currency: "USD"
 *               createdAt: "2024-08-24T10:00:00Z"
 *               updatedAt: "2024-08-24T10:00:00Z"
 *               expenseReviewId: null
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required. Please provide a valid token."
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Expense not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 *   put:
 *     summary: Update an existing expense
 *     description: Updates an existing expense belonging to the authenticated user. All fields are optional for updates.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the expense to update
 *         example: "expense_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExpenseRequest'
 *           examples:
 *             partial_update:
 *               summary: Partial update (amount and description)
 *               value:
 *                 amount: 95.75
 *                 description: "Updated weekly grocery budget with additional items"
 *             category_change:
 *               summary: Category and quantity update
 *               value:
 *                 category: "MISCELLANEOUS"
 *                 qty: 3
 *                 amount: 120.00
 *             currency_conversion:
 *               summary: Currency change
 *               value:
 *                 currency: "EUR"
 *                 amount: 78.50
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *             example:
 *               id: "expense_123"
 *               name: "Weekly Groceries"
 *               description: "Updated weekly grocery budget with additional items"
 *               qty: 1
 *               category: "FOOD"
 *               userId: "user_456"
 *               amount: 95.75
 *               amountUsd: 95.75
 *               currency: "USD"
 *               createdAt: "2024-08-24T10:00:00Z"
 *               updatedAt: "2024-08-24T11:30:00Z"
 *               expenseReviewId: null
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               invalid_amount:
 *                 summary: Invalid amount
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "amount"
 *                       message: "Amount must be a number"
 *               invalid_category:
 *                 summary: Invalid category
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "category"
 *                       message: "Category must be a valid category (FOOD, TRANSPORT, UTILITIES, ...)"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required. Please provide a valid token."
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Expense not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 *   delete:
 *     summary: Delete an expense
 *     description: Permanently deletes an expense belonging to the authenticated user. This action cannot be undone.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the expense to delete
 *         example: "expense_123"
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Expense deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required. Please provide a valid token."
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Expense not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
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
