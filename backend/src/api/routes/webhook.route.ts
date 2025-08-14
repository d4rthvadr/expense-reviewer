import Express from 'express';
import { clerkWebhookController } from '@api/controllers/clerk-webhook.controller';

const route = Express.Router();

// Webhook endpoint for Clerk events
// Note: This should be a raw body, not JSON parsed
route.post(
  '/clerk',
  Express.raw({ type: 'application/json' }),
  clerkWebhookController.handleWebhook as Express.RequestHandler
);

export default route;
