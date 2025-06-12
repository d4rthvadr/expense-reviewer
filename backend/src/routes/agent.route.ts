import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { body } from 'express-validator';
import { validateRequest } from '@middlewares/utils/validators';
import { agentController } from '@controllers/agent.controller';

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
