import { Request, Response } from 'express';
import {
  UserJSON,
  WebhookEvent,
  SessionWebhookEvent,
  UserWebhookEvent,
} from '@clerk/backend';
import { verifyWebhook } from '@clerk/express/webhooks';
import { log } from '@infra/logger';
import { userService } from '@domain/services/user.service';

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

  /**
   * Type guard to determine if the provided data conforms to the `UserJSON` interface.
   *
   * @param data - The data object to check, expected to be of type `UserWebhookEvent['data']`.
   * @returns `true` if the data is a `UserJSON` object (i.e., it is an object containing both 'id' and 'email_addresses' properties), otherwise `false`.
   */
  private isUserJson = (data: UserWebhookEvent['data']): data is UserJSON => {
    return (
      data &&
      typeof data === 'object' &&
      'id' in data &&
      'email_addresses' in data
    );
  };

  private handleUserCreated = async (event: UserWebhookEvent) => {
    log.info(
      `Handling user.created event in ClerkWebhookController meta: ${JSON.stringify(event)}`
    );

    if (!this.isUserJson(event.data)) {
      log.error('Invalid user.created webhook event data');
      return;
    }
    const userData = event.data;

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

  private handleSessionCreated = async (event: SessionWebhookEvent) => {
    log.info(
      `Handling session.created event in ClerkWebhookController meta: ${JSON.stringify(event)}`
    );

    // Type assertion for session.created event
    const sessionData = event.data;
    const { user_id, last_active_at } = sessionData;

    if (!user_id) {
      log.error('No user ID found in session.created webhook event');
      return;
    }

    log.info(`Updating last login for user with Clerk ID: ${user_id}`);

    try {
      await userService.updateLastLogin(user_id, last_active_at);
      log.info(
        `Successfully updated last login for user with Clerk ID: ${user_id}`
      );
    } catch (error) {
      log.error(
        `Failed to update last login for user with Clerk ID ${user_id}: ${error}`
      );
      // Not throwing the error to avoid webhook failures
    }
  };
}

export const clerkWebhookController = new ClerkWebhookController();
