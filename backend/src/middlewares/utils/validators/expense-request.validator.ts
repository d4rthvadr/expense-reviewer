import { body, param } from 'express-validator';

export const createExpenseValidators = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
  body('type')
    .isString()
    .withMessage('Type must be a string')
    .notEmpty()
    .withMessage('Type is required'),
  body('items')
    .isArray()
    .withMessage('Items must be an array')
    .notEmpty()
    .withMessage('At least one item is required'),
  body('items.*.name')
    .isString()
    .withMessage('Item name must be a string')
    .notEmpty()
    .withMessage('Item name is required'),
  body('items.*.amount')
    .isNumeric()
    .withMessage('Item amount must be a number')
    .notEmpty()
    .withMessage('Item amount is required'),
  body('items.*.qty')
    .optional()
    .isNumeric()
    .withMessage('Item quantity must be a number'),
  body('items.*.description')
    .optional()
    .isString()
    .withMessage('Item description must be a string'),
];

export const updateExpenseValidators = [
  ...createExpenseValidators,
  param('expenseId')
    .isString()
    .withMessage('Expense ID must be a string')
    .notEmpty()
    .withMessage('Expense ID is required'),
];
