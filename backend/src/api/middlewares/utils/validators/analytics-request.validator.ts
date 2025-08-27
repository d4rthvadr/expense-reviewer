import { query } from 'express-validator';

export const getTransactionsOverTimeValidators = [
  query('dateFrom')
    .notEmpty()
    .withMessage('dateFrom is required')
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO date string'),

  query('dateTo')
    .notEmpty()
    .withMessage('dateTo is required')
    .isISO8601()
    .withMessage('dateTo must be a valid ISO date string'),

  query('groupBy')
    .notEmpty()
    .withMessage('groupBy is required')
    .isIn(['day', 'week', 'month'])
    .withMessage('groupBy must be one of: day, week, month'),

  query('transactionType')
    .optional()
    .isIn(['EXPENSE', 'INCOME'])
    .withMessage('transactionType must be either EXPENSE or INCOME'),

  query('userId').optional().isString().withMessage('userId must be a string'),
];

export const getBudgetVsTransactionsValidators = [
  query('dateFrom')
    .notEmpty()
    .withMessage('dateFrom is required')
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO date string'),

  query('dateTo')
    .notEmpty()
    .withMessage('dateTo is required')
    .isISO8601()
    .withMessage('dateTo must be a valid ISO date string'),

  query('userId').optional().isString().withMessage('userId must be a string'),
];
