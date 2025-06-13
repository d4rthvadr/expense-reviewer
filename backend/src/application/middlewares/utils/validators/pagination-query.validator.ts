import { query } from 'express-validator';

export const paginationQueryParamsValidators = [
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a number')
    .default(0),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a number')
    .default(10),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('SortBy must be a string')
    .isIn(['createdAt', 'updatedAt'])
    .default('createdAt'),
  query('sortDir')
    .optional()
    .isString()
    .withMessage('SortDir must be a string'),
];
