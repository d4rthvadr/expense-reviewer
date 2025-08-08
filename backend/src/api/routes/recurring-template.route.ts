import { Router } from 'express';
import { asyncHandler } from './utils/async-handler';
import { validateRequest } from '../middlewares/utils/validators/validate-request';
import { recurringTemplateController } from '../controllers/recurring-template.controller';
import {
  createRecurringTemplateValidators,
  updateRecurringTemplateValidators,
} from '../middlewares/utils/validators/recurring-template-request.validator';

const route = Router();

// POST /api/recurring-templates
route.post(
  '/',
  createRecurringTemplateValidators,
  validateRequest,
  asyncHandler(recurringTemplateController.create)
);

// GET /api/recurring-templates/:templateId
route.get('/:templateId', asyncHandler(recurringTemplateController.findOne));

// GET /api/recurring-templates
route.get('/', asyncHandler(recurringTemplateController.find));

// PUT /api/recurring-templates/:templateId
route.put(
  '/:templateId',
  updateRecurringTemplateValidators,
  validateRequest,
  asyncHandler(recurringTemplateController.update)
);

// DELETE /api/recurring-templates/:templateId
route.delete('/:templateId', asyncHandler(recurringTemplateController.delete));

// GET /api/recurring-templates/user/:userId
// route.get(
//   '/user/:userId',
//   asyncHandler(recurringTemplateController.findByUserId)
// );

// GET /api/recurring-templates/active/by-type
route.get(
  '/active/by-type',
  asyncHandler(recurringTemplateController.findActiveByType)
);

export default route;
