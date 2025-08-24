import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { validateRequest } from '../middlewares/utils/validators/validate-request';
import {
  createBudgetValidators,
  paginationQueryParamsValidators,
  updateBudgetValidators,
} from '@api/middlewares/utils/validators';
import { budgetController } from '@api/controllers/budget.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     description: Creates a new budget for the authenticated user. The budget can be a one-time budget or a recurring budget linked to a template.
 *     tags:
 *       - Budgets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *           examples:
 *             simple_budget:
 *               summary: Simple one-time budget
 *               value:
 *                 name: "Monthly Groceries"
 *                 amount: 500
 *                 currency: "USD"
 *                 category: "FOOD"
 *                 description: "Budget for monthly grocery shopping"
 *                 isRecurring: false
 *             recurring_budget:
 *               summary: Recurring budget with template
 *               value:
 *                 name: "Monthly Transportation"
 *                 amount: 200
 *                 currency: "USD"
 *                 category: "TRANSPORT"
 *                 description: "Monthly transportation budget"
 *                 isRecurring: true
 *                 recurringTemplateId: "template_123"
 *     responses:
 *       201:
 *         description: Budget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
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
 *               message: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
// /api/budgets
route.post(
  '/',
  createBudgetValidators,
  validateRequest,
  asyncHandler(budgetController.create)
);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get a list of budgets
 *     description: Retrieves a paginated list of budgets for the authenticated user. Supports pagination with configurable page size.
 *     tags:
 *       - Budgets
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
 *         description: Number of budgets per page
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, EDUCATION, SHOPPING, MISCELLANEOUS, PERSONAL_AND_LIFESTYLE, TRAVEL, GIFTS_OR_DONATIONS, HOUSING, SAVINGS_OR_INVESTMENTS, INSURANCE, OTHER]
 *         description: Filter budgets by category
 *         example: FOOD
 *       - in: query
 *         name: isRecurring
 *         schema:
 *           type: boolean
 *         description: Filter budgets by recurring status
 *         example: true
 *     responses:
 *       200:
 *         description: List of budgets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BudgetListResponse'
 *             examples:
 *               with_budgets:
 *                 summary: Response with budget data
 *                 value:
 *                   data:
 *                     - id: "budget_123"
 *                       name: "Monthly Groceries"
 *                       userId: "user_456"
 *                       amount: 500
 *                       amountUsd: 500
 *                       isRecurring: false
 *                       recurringTemplateId: null
 *                       currency: "USD"
 *                       category: "FOOD"
 *                       description: "Budget for monthly grocery shopping"
 *                       createdAt: "2024-08-24T10:00:00Z"
 *                       updatedAt: "2024-08-24T10:00:00Z"
 *                     - id: "budget_789"
 *                       name: "Transportation"
 *                       userId: "user_456"
 *                       amount: 200
 *                       amountUsd: 200
 *                       isRecurring: true
 *                       recurringTemplateId: "template_123"
 *                       currency: "USD"
 *                       category: "TRANSPORT"
 *                       description: "Monthly transportation budget"
 *                       createdAt: "2024-08-24T09:00:00Z"
 *                       updatedAt: "2024-08-24T09:00:00Z"
 *                   pagination:
 *                     total: 25
 *                     page: 1
 *                     limit: 10
 *                     totalPages: 3
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
 *               message: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
// /api/budgets
route.get(
  '/',
  paginationQueryParamsValidators,
  validateRequest,
  asyncHandler(budgetController.find)
);

/**
 * @swagger
 * /api/budgets/{budgetId}:
 *   get:
 *     summary: Get a specific budget by ID
 *     description: Retrieves detailed information about a specific budget belonging to the authenticated user.
 *     tags:
 *       - Budgets
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the budget
 *         example: "budget_123"
 *     responses:
 *       200:
 *         description: Budget details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 *             example:
 *               id: "budget_123"
 *               name: "Monthly Groceries"
 *               userId: "user_456"
 *               amount: 500
 *               amountUsd: 500
 *               isRecurring: false
 *               recurringTemplateId: null
 *               currency: "USD"
 *               category: "FOOD"
 *               description: "Budget for monthly grocery shopping"
 *               createdAt: "2024-08-24T10:00:00Z"
 *               updatedAt: "2024-08-24T10:00:00Z"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required"
 *       404:
 *         description: Budget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Budget not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
// /api/budgets/:id
route.get('/:budgetId', asyncHandler(budgetController.findOne));

/**
 * @swagger
 * /api/budgets/{budgetId}:
 *   put:
 *     summary: Update an existing budget
 *     description: Updates an existing budget belonging to the authenticated user. All fields are optional for updates.
 *     tags:
 *       - Budgets
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the budget to update
 *         example: "budget_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBudgetRequest'
 *           examples:
 *             partial_update:
 *               summary: Partial update (amount and description)
 *               value:
 *                 amount: 600
 *                 description: "Updated monthly grocery budget with inflation adjustment"
 *             category_change:
 *               summary: Category and currency update
 *               value:
 *                 category: "MISCELLANEOUS"
 *                 currency: "EUR"
 *                 amount: 450
 *             recurring_conversion:
 *               summary: Convert to recurring budget
 *               value:
 *                 isRecurring: true
 *                 recurringTemplateId: "template_456"
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 *             example:
 *               id: "budget_123"
 *               name: "Monthly Groceries"
 *               userId: "user_456"
 *               amount: 600
 *               amountUsd: 600
 *               isRecurring: false
 *               recurringTemplateId: null
 *               currency: "USD"
 *               category: "FOOD"
 *               description: "Updated monthly grocery budget with inflation adjustment"
 *               createdAt: "2024-08-24T10:00:00Z"
 *               updatedAt: "2024-08-24T11:30:00Z"
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
 *               invalid_recurring_setup:
 *                 summary: Invalid recurring setup
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "recurringTemplateId"
 *                       message: "Recurring template ID is required when isRecurring is true"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required"
 *       404:
 *         description: Budget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Budget not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
// /api/budgets/:id
route.put(
  '/:budgetId',
  updateBudgetValidators,
  validateRequest,
  asyncHandler(budgetController.update)
);

/**
 * @swagger
 * /api/budgets/{budgetId}:
 *   delete:
 *     summary: Delete a budget
 *     description: Permanently deletes a budget belonging to the authenticated user. This action cannot be undone.
 *     tags:
 *       - Budgets
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the budget to delete
 *         example: "budget_123"
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Budget deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Authentication required"
 *       404:
 *         description: Budget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Budget not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
// /api/budgets/:id
route.delete('/:budgetId', asyncHandler(budgetController.delete));

export default route;
