import { Request, Response } from 'express';
import { WebhookEvent } from '@clerk/backend';
import { verifyWebhook } from '@clerk/express/webhooks';
import { log } from '@infra/logger';
import { userService } from '@domain/services/user.service';

interface EventData {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
}

interface SessionEventData {
  id: string;
  user_id: string;
  created_at: number;
  status: string;
}

export class ClerkWebhookController {
  handleWebhook = async (req: Request, res: Response): Promise<unknown> => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!WEBHOOK_SECRET) {
      log.error('CLERK_WEBHOOK_SIGNING_SECRET is not set');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    try {
      const evt: WebhookEvent = await verifyWebhook(req);

      const { id } = evt.data;
      const eventType = evt.type;

      log.info(`Received webhook with ID ${id} and event type of ${eventType}`);

      log.info(`Received webhook event: ${eventType}`);

      switch (eventType) {
        case 'user.created':
          await this.handleUserCreated(evt);
          break;
        case 'session.created':
          await this.handleSessionCreated(evt);
          break;
        default:
          log.info(`Unhandled webhook event: ${eventType}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      log.error(`Error verifying webhook: ${error}`);
      return res.status(500).json({ error: 'Webhook verification failed' });
    }
  };

  private handleUserCreated = async (event: WebhookEvent) => {
    log.info(
      `Handling user.created event in ClerkWebhookController meta: ${JSON.stringify(event)}`
    );
    // Type assertion for user.created event
    const userData = event.data as EventData;
    const { id, email_addresses, first_name, last_name } = userData;

    if (!id) {
      log.error('No user ID found in webhook event');
      return;
    }

    const userPayload = {
      email: email_addresses?.[0]?.email_address || '',
      firstName: first_name || null,
      lastName: last_name || null,
    };

    log.info(
      `Creating user in database for Clerk ID: ${id} with email: ${userPayload.email}`
    );

    await userService.createFromClerk(userPayload, id);

    log.info(`Successfully created user with Clerk ID: ${id}`);
  };

  private handleSessionCreated = async (event: WebhookEvent) => {
    log.info(
      `Handling session.created event in ClerkWebhookController meta: ${JSON.stringify(event)}`
    );

    // Type assertion for session.created event
    const sessionData = event.data as SessionEventData;
    const { user_id } = sessionData;

    if (!user_id) {
      log.error('No user ID found in session.created webhook event');
      return;
    }

    log.info(`Updating last login for user with Clerk ID: ${user_id}`);

    try {
      await userService.updateLastLogin(user_id);
      log.info(
        `Successfully updated last login for user with Clerk ID: ${user_id}`
      );
    } catch (error) {
      log.error(
        `Failed to update last login for user with Clerk ID ${user_id}: ${error}`
      );
      // Don't throw the error to avoid webhook failures
    }
  };
}

export const clerkWebhookController = new ClerkWebhookController();
