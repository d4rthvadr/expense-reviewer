import { body, param } from 'express-validator';

export const createTransactionReviewValidators = [
  body('reviewText')
    .isString()
    .withMessage('Review text must be a string')
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Review text must be between 1 and 2000 characters'),
];

export const updateTransactionReviewValidators = [
  body('reviewText')
    .optional()
    .isString()
    .withMessage('Review text must be a string')
    .notEmpty()
    .withMessage('Review text cannot be empty')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Review text must be between 1 and 2000 characters'),
  param('reviewId')
    .isString()
    .withMessage('Review ID must be a string')
    .notEmpty()
    .withMessage('Review ID is required'),
];

export const transactionReviewIdValidator = [
  param('reviewId')
    .isString()
    .withMessage('Review ID must be a string')
    .notEmpty()
    .withMessage('Review ID is required'),
];
