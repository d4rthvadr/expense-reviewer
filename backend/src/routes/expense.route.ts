import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';
import {
  updateExpenseValidators,
  createExpenseValidators,
} from '../middlewares/utils/expense-validators';
import { validateRequest } from '../middlewares/utils/validate-request';

const route = Express.Router();

const { expenseController } = dependencyInjectionContainer;

// /api/expenses
route.post(
  '/',
  createExpenseValidators,
  validateRequest,
  asyncHandler(expenseController.create)
);

// /api/expenses/:id
route.get('/:expenseId', asyncHandler(expenseController.findOne));

// /api/expenses
route.get('/', asyncHandler(expenseController.find));

// /api/expenses/:id
route.put(
  '/:expenseId',
  updateExpenseValidators,
  validateRequest,
  asyncHandler(expenseController.update)
);

// /api/expenses/:id
route.delete('/:expenseId', asyncHandler(expenseController.delete));

export default route;
