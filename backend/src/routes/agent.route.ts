import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { dependencyInjectionContainer } from './utils/di-container';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/utils/validate-request';

const route = Express.Router();

const { agentController } = dependencyInjectionContainer;

// /api/agents/process-text
route.post(
  '/process-text',
  [
    body('text')
      .notEmpty()
      .isLength({ min: 4 })
      .withMessage('Text is required'),
  ],
  validateRequest,
  asyncHandler(agentController.processText)
);

export default route;
