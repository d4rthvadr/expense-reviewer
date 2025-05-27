import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';

import { validateRequest } from '../middlewares/utils/validate-request';
import { createBudgetValidators } from '@middlewares/utils/budget-validators';
import { updateExpenseValidators } from '@middlewares/utils/expense-validators';

const route = Express.Router();

const { budgetController } = dependencyInjectionContainer;

// /api/budgets
route.post(
  '/',
  createBudgetValidators,
  validateRequest,
  asyncHandler(budgetController.create)
);

// /api/budgets/:id
route.get('/:budgetId', asyncHandler(budgetController.findOne));

// /api/budgets
route.get('/', asyncHandler(budgetController.find));

// /api/budgets/:id
route.put(
  '/:budgetId',
  updateExpenseValidators,
  validateRequest,
  asyncHandler(budgetController.update)
);

// /api/budgets/:id
route.delete('/:budgetId', asyncHandler(budgetController.delete));

export default route;
