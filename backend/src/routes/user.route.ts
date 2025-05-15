import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/utils/validate-request';

const route = Express.Router();

const { userController } = dependencyInjectionContainer;

// /api/users/id
route.get('/:id', asyncHandler(userController.findOne));
// /api/users
route.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .isLength({ min: 4 })
      .withMessage('Name is required'),
    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(userController.create)
);

export default route;
