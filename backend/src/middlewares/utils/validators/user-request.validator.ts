import { body } from 'express-validator';
import { Currency } from '../../../../generated/prisma';

export const createUserRequestValidator = [
  body('name')
    .trim()
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage('Name is required'),
  body('email').trim().notEmpty().isEmail().withMessage('Email must be valid'),
  body('currency')
    .optional()
    .isIn(Object.values(Currency))
    .withMessage(
      `Currency must be a valid currency. (${Object.values(Currency).join(', ')})`
    )
    .notEmpty()
    .withMessage('Currency is required'),
  body('password')
    .trim()
    .notEmpty()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password is required'),
];
