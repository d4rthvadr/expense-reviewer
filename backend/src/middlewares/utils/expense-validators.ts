import { body, param, CustomValidator } from 'express-validator';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';

// Custom validator to check if expense name is unique (excluding current expense)
const isNameUnique: CustomValidator = async (name, { req }) => {
  if (!name) return true; // Skip validation if name is not provided

  // Safely access the expenseId parameter
  const expenseId = req.params?.expenseId || '';
  const expenseRepository = new ExpenseRepository();

  // Find if there's any expense with the same name but different ID
  const existingExpense = await expenseRepository.expense.findFirst({
    where: {
      name,
      ...(expenseId ? { id: { not: expenseId } } : {}), // Only exclude if expenseId exists
    },
  });

  if (existingExpense) {
    throw new Error(`Expense with name "${name}" already exists`);
  }

  return true;
};

export const createExpenseValidators = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required')
    .custom(isNameUnique), // TODO: let database handle this. This helps us to only check if the name is unique when creating the expense
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
  param('expenseId')
    .isString()
    .withMessage('Expense ID must be a string')
    .notEmpty()
    .withMessage('Expense ID is required'),
  // body validations
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name cannot be empty if provided')
    .custom(isNameUnique),
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
