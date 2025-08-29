import { TransactionType } from '@domain/enum/transaction-type.enum';
import { query } from 'express-validator';

export const paginationQueryParamsValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a number greater than 0')
    .default(1),
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
  query('type')
    .optional()
    .isString()
    .withMessage('Type must be a string')
    .isIn(Object.values(TransactionType))
    .default('ALL'),
];
