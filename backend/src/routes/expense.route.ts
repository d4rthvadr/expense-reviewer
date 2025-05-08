import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';

const route = Express.Router();

const { expenseController } = dependencyInjectionContainer;

// /api/expenses
route.post('/', asyncHandler(expenseController.create));

export default route;
