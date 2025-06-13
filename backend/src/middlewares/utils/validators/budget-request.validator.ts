import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { body, param } from 'express-validator';

export const createBudgetValidators = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .notEmpty()
    .withMessage('Amount is required'),
  body('currency')
    .optional()
    .isIn(Object.values(Currency))
    .withMessage(
      `Currency must be a valid currency. (${Object.values(Currency).join(', ')})`
    )
    .notEmpty()
    .withMessage('Currency is required'),
  body('category')
    .isString()
    .withMessage('Category must be a string')
    .isIn(Object.values(Category))
    .withMessage(
      `Category must be a valid category (${Object.values(Category).join(', ')})`
    )
    .notEmpty()
    .withMessage('Category is required'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
];

export const updateBudgetValidators = [
  ...createBudgetValidators,
  param('budgetId')
    .isString()
    .withMessage('Budget ID must be a string')
    .notEmpty()
    .withMessage('Budget ID is required'),
];
