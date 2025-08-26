import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import {
  paginationQueryParamsValidators,
  validateRequest,
  createTransactionValidators,
  updateTransactionValidators,
  transactionIdValidator,
} from '@api/middlewares/utils/validators/';
import { transactionController } from '@api/controllers/transaction.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction (expense or income) for the authenticated user. The transaction amount is automatically converted to USD for tracking purposes.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       '201':
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       '400':
 *         description: Bad request - invalid transaction data
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.post(
  '/',
  createTransactionValidators,
  validateRequest,
  asyncHandler(transactionController.create)
);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user transactions
 *     description: Retrieves a paginated list of transactions for the authenticated user with optional filtering.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of transactions per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [EXPENSE, INCOME]
 *         description: Filter by transaction type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       '200':
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTransactionResponse'
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.get(
  '/',
  paginationQueryParamsValidators,
  validateRequest,
  asyncHandler(transactionController.find)
);

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieves a specific transaction by its ID for the authenticated user.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the transaction
 *     responses:
 *       '200':
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       '404':
 *         description: Transaction not found
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.get(
  '/:transactionId',
  transactionIdValidator,
  validateRequest,
  asyncHandler(transactionController.findOne)
);

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   put:
 *     summary: Update transaction
 *     description: Updates an existing transaction for the authenticated user.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionRequest'
 *     responses:
 *       '200':
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       '400':
 *         description: Bad request - invalid transaction data
 *       '404':
 *         description: Transaction not found
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.put(
  '/:transactionId',
  updateTransactionValidators,
  validateRequest,
  asyncHandler(transactionController.update)
);

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   delete:
 *     summary: Delete transaction
 *     description: Deletes a specific transaction for the authenticated user.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the transaction
 *     responses:
 *       '204':
 *         description: Transaction deleted successfully
 *       '404':
 *         description: Transaction not found
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.delete(
  '/:transactionId',
  transactionIdValidator,
  validateRequest,
  asyncHandler(transactionController.delete)
);

export { route as transactionRoute };
