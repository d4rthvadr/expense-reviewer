import { query } from 'express-validator';

export const getExpensesOverTimeValidators = [
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

  query('userId').optional().isString().withMessage('userId must be a string'),
];

export const getBudgetVsExpensesValidators = [
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
