import { Router } from 'express';
import { asyncHandler } from './utils/async-handler';
import { validateRequest } from '../middlewares/utils/validators/validate-request';
import { recurringTemplateController } from '../controllers/recurring-template.controller';
import {
  createRecurringTemplateValidators,
  updateRecurringTemplateValidators,
} from '../middlewares/utils/validators/recurring-template-request.validator';

const route = Router();

/**
 * @swagger
 * /api/recurring-templates:
 *   post:
 *     summary: Create a new recurring template
 *     description: Create a new recurring template for budget or expense tracking. Templates can be used to automate recurring financial entries.
 *     tags: [Recurring Templates]
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRecurringTemplateRequest'
 *           examples:
 *             weekly_budget_template:
 *               summary: Weekly budget template
 *               value:
 *                 name: "Weekly Groceries Budget"
 *                 type: "BUDGET"
 *                 amount: 150.00
 *                 isRecurring: true
 *                 recurringPeriod: "WEEKLY"
 *                 startDate: "2024-01-15T00:00:00Z"
 *                 endDate: "2024-12-31T23:59:59Z"
 *                 isActive: true
 *                 currency: "USD"
 *                 category: "FOOD"
 *                 description: "Weekly grocery shopping budget"
 *             monthly_expense_template:
 *               summary: Monthly expense template
 *               value:
 *                 name: "Monthly Rent"
 *                 type: "EXPENSE"
 *                 amount: 1200.00
 *                 isRecurring: true
 *                 recurringPeriod: "MONTHLY"
 *                 startDate: "2024-01-01T00:00:00Z"
 *                 isActive: true
 *                 currency: "USD"
 *                 category: "HOUSING"
 *                 description: "Monthly rent payment"
 *             one_time_template:
 *               summary: One-time template
 *               value:
 *                 name: "Project Bonus"
 *                 type: "BUDGET"
 *                 amount: 5000.00
 *                 isRecurring: false
 *                 startDate: "2024-03-01T00:00:00Z"
 *                 isActive: true
 *                 currency: "USD"
 *                 category: "OTHER"
 *                 description: "One-time project completion bonus"
 *     responses:
 *       201:
 *         description: Recurring template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recurring template created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RecurringTemplate'
 *             examples:
 *               success_response:
 *                 summary: Successful template creation
 *                 value:
 *                   success: true
 *                   message: "Recurring template created successfully"
 *                   data:
 *                     id: "clp1234567890abcdef"
 *                     name: "Weekly Groceries Budget"
 *                     userId: "user_1234567890"
 *                     type: "BUDGET"
 *                     amount: 150.00
 *                     isRecurring: true
 *                     recurringPeriod: "WEEKLY"
 *                     startDate: "2024-01-15T00:00:00Z"
 *                     endDate: "2024-12-31T23:59:59Z"
 *                     isActive: true
 *                     currency: "USD"
 *                     category: "FOOD"
 *                     description: "Weekly grocery shopping budget"
 *                     createdAt: "2024-01-10T10:30:00Z"
 *                     updatedAt: "2024-01-10T10:30:00Z"
 *       400:
 *         description: Bad request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missing_required_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "type"
 *                       message: "Type is required"
 *                     - field: "amount"
 *                       message: "Amount is required"
 *                     - field: "category"
 *                       message: "Category is required"
 *               invalid_recurring_period:
 *                 summary: Invalid recurring period for recurring template
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "recurringPeriod"
 *                       message: "Recurring period is required when isRecurring is true"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/recurring-templates
route.post(
  '/',
  createRecurringTemplateValidators,
  validateRequest,
  asyncHandler(recurringTemplateController.create)
);

/**
 * @swagger
 * /api/recurring-templates/{templateId}:
 *   get:
 *     summary: Get a recurring template by ID
 *     description: Retrieve detailed information about a specific recurring template using its unique identifier.
 *     tags: [Recurring Templates]
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the recurring template
 *         example: "clp1234567890abcdef"
 *     responses:
 *       200:
 *         description: Recurring template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recurring template retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RecurringTemplate'
 *             examples:
 *               budget_template:
 *                 summary: Budget template details
 *                 value:
 *                   success: true
 *                   message: "Recurring template retrieved successfully"
 *                   data:
 *                     id: "clp1234567890abcdef"
 *                     name: "Monthly Transportation Budget"
 *                     userId: "user_1234567890"
 *                     type: "BUDGET"
 *                     amount: 200.00
 *                     isRecurring: true
 *                     recurringPeriod: "MONTHLY"
 *                     startDate: "2024-01-01T00:00:00Z"
 *                     endDate: null
 *                     isActive: true
 *                     currency: "USD"
 *                     category: "TRANSPORT"
 *                     description: "Monthly budget for transportation expenses"
 *                     createdAt: "2024-01-01T08:00:00Z"
 *                     updatedAt: "2024-01-15T14:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Recurring template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *             example:
 *               success: false
 *               message: "Recurring template not found"
 *               error: "No template found with the provided ID"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/recurring-templates/:templateId
route.get('/:templateId', asyncHandler(recurringTemplateController.findOne));

/**
 * @swagger
 * /api/recurring-templates:
 *   get:
 *     summary: Get all recurring templates
 *     description: Retrieve a paginated list of recurring templates for the authenticated user. Supports filtering by type, active status, and other criteria.
 *     tags: [Recurring Templates]
 *     security:
 *       - ClerkAuth: []
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
 *         description: Number of templates per page
 *         example: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [BUDGET, EXPENSE]
 *         description: Filter by template type
 *         example: "BUDGET"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, EDUCATION, SHOPPING, MISCELLANEOUS, PERSONAL_AND_LIFESTYLE, TRAVEL, GIFTS_OR_DONATIONS, HOUSING, SAVINGS_OR_INVESTMENTS, INSURANCE, OTHER]
 *         description: Filter by category
 *         example: "FOOD"
 *       - in: query
 *         name: isRecurring
 *         schema:
 *           type: boolean
 *         description: Filter by recurring status
 *         example: true
 *     responses:
 *       200:
 *         description: Recurring templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recurring templates retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RecurringTemplateListResponse'
 *             examples:
 *               templates_list:
 *                 summary: List of recurring templates
 *                 value:
 *                   success: true
 *                   message: "Recurring templates retrieved successfully"
 *                   data:
 *                     data:
 *                       - id: "clp1234567890abcdef"
 *                         name: "Monthly Rent"
 *                         userId: "user_1234567890"
 *                         type: "EXPENSE"
 *                         amount: 1200.00
 *                         isRecurring: true
 *                         recurringPeriod: "MONTHLY"
 *                         startDate: "2024-01-01T00:00:00Z"
 *                         endDate: null
 *                         isActive: true
 *                         currency: "USD"
 *                         category: "HOUSING"
 *                         description: "Monthly rent payment"
 *                         createdAt: "2024-01-01T08:00:00Z"
 *                         updatedAt: "2024-01-01T08:00:00Z"
 *                       - id: "clp0987654321fedcba"
 *                         name: "Weekly Groceries"
 *                         userId: "user_1234567890"
 *                         type: "EXPENSE"
 *                         amount: 150.00
 *                         isRecurring: true
 *                         recurringPeriod: "WEEKLY"
 *                         startDate: "2024-01-01T00:00:00Z"
 *                         endDate: "2024-12-31T23:59:59Z"
 *                         isActive: true
 *                         currency: "USD"
 *                         category: "FOOD"
 *                         description: "Weekly grocery shopping"
 *                         createdAt: "2024-01-01T08:15:00Z"
 *                         updatedAt: "2024-01-10T12:00:00Z"
 *                     pagination:
 *                       total: 15
 *                       page: 1
 *                       limit: 10
 *                       totalPages: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/recurring-templates
route.get('/', asyncHandler(recurringTemplateController.find));

/**
 * @swagger
 * /api/recurring-templates/{templateId}:
 *   put:
 *     summary: Update a recurring template
 *     description: Update an existing recurring template. All fields are optional, only provided fields will be updated.
 *     tags: [Recurring Templates]
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the recurring template to update
 *         example: "clp1234567890abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRecurringTemplateRequest'
 *           examples:
 *             update_amount:
 *               summary: Update template amount
 *               value:
 *                 amount: 175.00
 *                 description: "Increased weekly grocery budget"
 *             deactivate_template:
 *               summary: Deactivate template
 *               value:
 *                 isActive: false
 *                 description: "Template no longer needed"
 *             extend_end_date:
 *               summary: Extend template end date
 *               value:
 *                 endDate: "2025-12-31T23:59:59Z"
 *                 description: "Extended template for another year"
 *             change_frequency:
 *               summary: Change recurring frequency
 *               value:
 *                 recurringPeriod: "MONTHLY"
 *                 description: "Changed from weekly to monthly"
 *     responses:
 *       200:
 *         description: Recurring template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recurring template updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RecurringTemplate'
 *             examples:
 *               updated_template:
 *                 summary: Successfully updated template
 *                 value:
 *                   success: true
 *                   message: "Recurring template updated successfully"
 *                   data:
 *                     id: "clp1234567890abcdef"
 *                     name: "Weekly Groceries Budget"
 *                     userId: "user_1234567890"
 *                     type: "EXPENSE"
 *                     amount: 175.00
 *                     isRecurring: true
 *                     recurringPeriod: "WEEKLY"
 *                     startDate: "2024-01-01T00:00:00Z"
 *                     endDate: "2025-12-31T23:59:59Z"
 *                     isActive: true
 *                     currency: "USD"
 *                     category: "FOOD"
 *                     description: "Increased weekly grocery budget"
 *                     createdAt: "2024-01-01T08:00:00Z"
 *                     updatedAt: "2024-01-15T14:30:00Z"
 *       400:
 *         description: Bad request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               invalid_amount:
 *                 summary: Invalid amount value
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "amount"
 *                       message: "Amount must be greater than 0"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Recurring template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *             example:
 *               success: false
 *               message: "Recurring template not found"
 *               error: "No template found with the provided ID"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// PUT /api/recurring-templates/:templateId
route.put(
  '/:templateId',
  updateRecurringTemplateValidators,
  validateRequest,
  asyncHandler(recurringTemplateController.update)
);

/**
 * @swagger
 * /api/recurring-templates/{templateId}:
 *   delete:
 *     summary: Delete a recurring template
 *     description: Permanently delete a recurring template. This action cannot be undone. Consider deactivating templates instead of deleting them for audit purposes.
 *     tags: [Recurring Templates]
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the recurring template to delete
 *         example: "clp1234567890abcdef"
 *     responses:
 *       200:
 *         description: Recurring template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recurring template deleted successfully"
 *             example:
 *               success: true
 *               message: "Recurring template deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Recurring template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *             example:
 *               success: false
 *               message: "Recurring template not found"
 *               error: "No template found with the provided ID"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// DELETE /api/recurring-templates/:templateId
route.delete('/:templateId', asyncHandler(recurringTemplateController.delete));

// GET /api/recurring-templates/user/:userId
// route.get(
//   '/user/:userId',
//   asyncHandler(recurringTemplateController.findByUserId)
// );

/**
 * @swagger
 * /api/recurring-templates/active/by-type:
 *   get:
 *     summary: Get active recurring templates by type
 *     description: Retrieve active recurring templates filtered by type (BUDGET or EXPENSE). This endpoint is useful for getting templates that are currently being used.
 *     tags: [Recurring Templates]
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BUDGET, EXPENSE]
 *         description: Type of templates to retrieve
 *         example: "BUDGET"
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
 *         description: Number of templates per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Active recurring templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Active recurring templates retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RecurringTemplateListResponse'
 *             examples:
 *               active_budget_templates:
 *                 summary: Active budget templates
 *                 value:
 *                   success: true
 *                   message: "Active recurring templates retrieved successfully"
 *                   data:
 *                     data:
 *                       - id: "clp1234567890abcdef"
 *                         name: "Monthly Food Budget"
 *                         userId: "user_1234567890"
 *                         type: "BUDGET"
 *                         amount: 500.00
 *                         isRecurring: true
 *                         recurringPeriod: "MONTHLY"
 *                         startDate: "2024-01-01T00:00:00Z"
 *                         endDate: null
 *                         isActive: true
 *                         currency: "USD"
 *                         category: "FOOD"
 *                         description: "Monthly food and dining budget"
 *                         createdAt: "2024-01-01T08:00:00Z"
 *                         updatedAt: "2024-01-01T08:00:00Z"
 *                       - id: "clp0987654321fedcba"
 *                         name: "Entertainment Budget"
 *                         userId: "user_1234567890"
 *                         type: "BUDGET"
 *                         amount: 200.00
 *                         isRecurring: true
 *                         recurringPeriod: "MONTHLY"
 *                         startDate: "2024-01-01T00:00:00Z"
 *                         endDate: "2024-12-31T23:59:59Z"
 *                         isActive: true
 *                         currency: "USD"
 *                         category: "ENTERTAINMENT"
 *                         description: "Monthly entertainment and leisure budget"
 *                         createdAt: "2024-01-01T08:15:00Z"
 *                         updatedAt: "2024-01-10T12:00:00Z"
 *                     pagination:
 *                       total: 8
 *                       page: 1
 *                       limit: 10
 *                       totalPages: 1
 *               active_expense_templates:
 *                 summary: Active expense templates
 *                 value:
 *                   success: true
 *                   message: "Active recurring templates retrieved successfully"
 *                   data:
 *                     data:
 *                       - id: "clp1111222233334444"
 *                         name: "Monthly Rent"
 *                         userId: "user_1234567890"
 *                         type: "EXPENSE"
 *                         amount: 1200.00
 *                         isRecurring: true
 *                         recurringPeriod: "MONTHLY"
 *                         startDate: "2024-01-01T00:00:00Z"
 *                         endDate: null
 *                         isActive: true
 *                         currency: "USD"
 *                         category: "HOUSING"
 *                         description: "Monthly rent payment"
 *                         createdAt: "2024-01-01T08:00:00Z"
 *                         updatedAt: "2024-01-01T08:00:00Z"
 *                     pagination:
 *                       total: 5
 *                       page: 1
 *                       limit: 10
 *                       totalPages: 1
 *       400:
 *         description: Bad request - Missing or invalid type parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - field: "type"
 *                   message: "Type parameter is required and must be either BUDGET or EXPENSE"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/recurring-templates/active/by-type
route.get(
  '/active/by-type',
  asyncHandler(recurringTemplateController.findActiveByType)
);

export default route;
