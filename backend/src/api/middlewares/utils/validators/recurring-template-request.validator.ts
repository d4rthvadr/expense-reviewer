import { body, ValidationChain } from 'express-validator';
import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { RecurringPeriod } from '@domain/enum/recurring-period.enum';
import { RecurringTemplateType } from '@domain/enum/recurring-template-type.enum';

export const createRecurringTemplateValidators: ValidationChain[] = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 255 characters'),

  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(Object.values(RecurringTemplateType))
    .withMessage(
      `Type must be one of: ${Object.values(RecurringTemplateType).join(', ')}`
    ),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),

  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),

  body('recurringPeriod')
    .optional()
    .isIn(Object.values(RecurringPeriod))
    .withMessage(
      `Recurring period must be one of: ${Object.values(RecurringPeriod).join(', ')}`
    )
    .custom((value, { req }) => {
      // If isRecurring is true, recurringPeriod should be provided
      if (req.body.isRecurring === true && !value) {
        throw new Error(
          'Recurring period is required when isRecurring is true'
        );
      }
      // If isRecurring is false, recurringPeriod should not be provided
      if (req.body.isRecurring === false && value) {
        throw new Error(
          'Recurring period should not be provided when isRecurring is false'
        );
      }
      return true;
    }),

  body('startDate')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('Start date must be a valid ISO 8601 date string'),

  body('endDate')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('End date must be a valid ISO 8601 date string')
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('currency')
    .optional()
    .isIn(Object.values(Currency))
    .withMessage(
      `Currency must be one of: ${Object.values(Currency).join(', ')}`
    ),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(Category))
    .withMessage(
      `Category must be one of: ${Object.values(Category).join(', ')}`
    ),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 100 })
    .withMessage('Description must not exceed 500 characters'),
];

export const updateRecurringTemplateValidators: ValidationChain[] = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 255 characters'),

  body('type')
    .optional()
    .isIn(Object.values(RecurringTemplateType))
    .withMessage(
      `Type must be one of: ${Object.values(RecurringTemplateType).join(', ')}`
    ),

  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),

  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),

  body('recurringPeriod')
    .optional()
    .isIn(Object.values(RecurringPeriod))
    .withMessage(
      `Recurring period must be one of: ${Object.values(RecurringPeriod).join(', ')}`
    )
    .custom((value, { req }) => {
      // Cross-validation with isRecurring field if provided
      if (req.body.isRecurring === true && !value) {
        throw new Error(
          'Recurring period is required when isRecurring is true'
        );
      }
      if (req.body.isRecurring === false && value) {
        throw new Error(
          'Recurring period should not be provided when isRecurring is false'
        );
      }
      return true;
    }),

  body('startDate')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('Start date must be a valid ISO 8601 date string'),

  body('endDate')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('End date must be a valid ISO 8601 date string')
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('currency')
    .optional()
    .isIn(Object.values(Currency))
    .withMessage(
      `Currency must be one of: ${Object.values(Currency).join(', ')}`
    ),

  body('category')
    .optional()
    .isIn(Object.values(Category))
    .withMessage(
      `Category must be one of: ${Object.values(Category).join(', ')}`
    ),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];
