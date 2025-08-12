import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { body, param } from 'express-validator';

export const createExpenseValidators = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .notEmpty()
    .withMessage('Amount is required'),
  body('category')
    .isIn(Object.values(Category))
    .withMessage(
      `Category must be a valid category (${Object.values(Category).join(', ')})`
    )
    .notEmpty()
    .withMessage('Category is required'),
  body('currency')
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

export const updateExpenseValidators = [
  ...createExpenseValidators,
  param('expenseId')
    .isString()
    .withMessage('Expense ID must be a string')
    .notEmpty()
    .withMessage('Expense ID is required'),
];
