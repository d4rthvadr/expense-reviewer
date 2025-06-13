import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { body } from 'express-validator';
import { agentController } from '@api/controllers/agent.controller';
import { validateRequest } from '@api/middlewares/utils/validators';

const route = Express.Router();
// /api/agents/process-text
route.post(
  '/process-text',
  //
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
