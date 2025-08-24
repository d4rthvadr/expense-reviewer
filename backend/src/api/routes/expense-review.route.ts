import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { validateRequest } from '../middlewares/utils/validators/validate-request';
import { paginationQueryParamsValidators } from '@api/middlewares/utils/validators';
import { expenseReviewController } from '@api/controllers/expense-review.controller';

const route = Express.Router();

// /api/expense-reviews
route.get(
  '/',
  paginationQueryParamsValidators,
  validateRequest,
  asyncHandler(expenseReviewController.find)
);

// /api/expense-reviews/:id
route.get('/:id', asyncHandler(expenseReviewController.findOne));

export default route;
