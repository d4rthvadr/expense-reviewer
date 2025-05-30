import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
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
  body('currency')
    .optional()
    .isIn(Object.values(Currency))
    .withMessage(
      `Currency must be a valid currency. (${Object.values(Currency).join(', ')})`
    )
    .notEmpty()
    .withMessage('Currency is required'),
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
  body('items.*.category')
    .isIn(Object.values(Category))
    .withMessage(
      `Category must be a valid category (${Object.values(Category).join(', ')})`
    )
    .notEmpty()
    .withMessage('Item category is required'),
  body('items.*.currency')
    .optional()
    .isIn(Object.values(Currency))
    .withMessage(
      `Item currency must be one of the following: (${Object.values(Currency).join(', ')})`
    ),
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
