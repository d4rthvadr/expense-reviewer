import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';

import { validateRequest } from '../middlewares/utils/validators/validate-request';
import {
  createBudgetValidators,
  paginationQueryParamsValidators,
  updateBudgetValidators,
} from '@middlewares/utils/validators';

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
route.get(
  '/',
  paginationQueryParamsValidators,
  validateRequest,
  asyncHandler(budgetController.find)
);

// /api/budgets/:id
route.put(
  '/:budgetId',
  updateBudgetValidators,
  validateRequest,
  asyncHandler(budgetController.update)
);

// /api/budgets/:id
route.delete('/:budgetId', asyncHandler(budgetController.delete));

export default route;
