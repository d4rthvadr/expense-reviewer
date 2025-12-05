import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionType } from '@domain/enum/transaction-type.enum';
import { body, param } from 'express-validator';

export const transactionIdValidator = [
  param('transactionId')
    .isString()
    .withMessage('Transaction ID must be a string')
    .notEmpty()
    .withMessage('Transaction ID is required'),
];

export const createTransactionValidators = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be greater than 0')
    .notEmpty()
    .withMessage('Amount cannot be empty'),
  body('category')
    .isIn(Object.values(Category))
    .withMessage(
      `Category must be a valid category (${Object.values(Category).join(', ')})`
    )
    .notEmpty()
    .withMessage('Category is required'),
  body('type')
    .isIn(Object.values(TransactionType))
    .withMessage(
      `Type must be one of the following: (${Object.values(TransactionType).join(', ')})`
    )
    .notEmpty()
    .withMessage('Transaction type is required'),
  body('currency')
    .optional()
    .isIn(Object.values(Currency))
    .withMessage(
      `Currency must be one of the following: (${Object.values(Currency).join(', ')})`
    ),
  body('qty').optional().isNumeric().withMessage('Quantity must be a number'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('createdAt')
    .optional()
    .isISO8601()
    .withMessage('CreatedAt must be a valid ISO 8601 date string')
    .notEmpty()
    .withMessage('CreatedAt is required'),
];

export const updateTransactionValidators = [
  ...createTransactionValidators,
  ...transactionIdValidator,
];
