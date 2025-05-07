import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';

const route = Express.Router();

const { userController } = dependencyInjectionContainer;

// /api/users/id
route.get('/:id', asyncHandler(userController.findOne));
// /api/users
route.post('/', asyncHandler(userController.create));

export default route;
