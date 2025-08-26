import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import {
  paginationQueryParamsValidators,
  validateRequest,
  createTransactionReviewValidators,
  updateTransactionReviewValidators,
  transactionReviewIdValidator,
} from '@api/middlewares/utils/validators/';
import { transactionReviewController } from '@api/controllers/transaction-review.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/transaction-reviews:
 *   post:
 *     summary: Create a new transaction review
 *     description: Creates a new transaction review for the authenticated user.
 *     tags:
 *       - Transaction Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewText:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 description: The review text content
 *             required:
 *               - reviewText
 *     responses:
 *       '201':
 *         description: Transaction review created successfully
 *       '400':
 *         description: Bad request - invalid review data
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.post(
  '/',
  createTransactionReviewValidators,
  validateRequest,
  asyncHandler(transactionReviewController.create)
);

/**
 * @swagger
 * /api/transaction-reviews:
 *   get:
 *     summary: Get user transaction reviews
 *     description: Retrieves a paginated list of transaction reviews for the authenticated user.
 *     tags:
 *       - Transaction Reviews
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
 *         description: Number of reviews per page
 *       - in: query
 *         name: includeTransactions
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include associated transactions
 *     responses:
 *       '200':
 *         description: Transaction reviews retrieved successfully
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.get(
  '/',
  paginationQueryParamsValidators,
  validateRequest,
  asyncHandler(transactionReviewController.find)
);

/**
 * @swagger
 * /api/transaction-reviews/{reviewId}:
 *   get:
 *     summary: Get transaction review by ID
 *     description: Retrieves a specific transaction review by its ID for the authenticated user.
 *     tags:
 *       - Transaction Reviews
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the review
 *     responses:
 *       '200':
 *         description: Transaction review retrieved successfully
 *       '404':
 *         description: Review not found
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.get(
  '/:reviewId',
  transactionReviewIdValidator,
  validateRequest,
  asyncHandler(transactionReviewController.findOne)
);

/**
 * @swagger
 * /api/transaction-reviews/{reviewId}:
 *   put:
 *     summary: Update transaction review
 *     description: Updates an existing transaction review for the authenticated user.
 *     tags:
 *       - Transaction Reviews
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewText:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 description: The updated review text content
 *     responses:
 *       '200':
 *         description: Transaction review updated successfully
 *       '400':
 *         description: Bad request - invalid review data
 *       '404':
 *         description: Review not found
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.put(
  '/:reviewId',
  updateTransactionReviewValidators,
  validateRequest,
  asyncHandler(transactionReviewController.update)
);

/**
 * @swagger
 * /api/transaction-reviews/{reviewId}:
 *   delete:
 *     summary: Delete transaction review
 *     description: Deletes a specific transaction review for the authenticated user.
 *     tags:
 *       - Transaction Reviews
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the review
 *     responses:
 *       '204':
 *         description: Transaction review deleted successfully
 *       '404':
 *         description: Review not found
 *       '401':
 *         description: Unauthorized - authentication required
 *       '500':
 *         description: Internal server error
 */
route.delete(
  '/:reviewId',
  transactionReviewIdValidator,
  validateRequest,
  asyncHandler(transactionReviewController.delete)
);

export { route as transactionReviewRoute };
