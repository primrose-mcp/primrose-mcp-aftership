/**
 * Notification Tools
 *
 * MCP tools for AfterShip notification management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AfterShipClient } from '../client.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all notification-related tools
 */
export function registerNotificationTools(server: McpServer, client: AfterShipClient): void {
  // ===========================================================================
  // Get Notification
  // ===========================================================================
  server.tool(
    'aftership_get_notification',
    `Get notification settings for a tracking.

Returns the email addresses and phone numbers that will receive notifications for this tracking.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)

Returns:
  Notification object with emails and smses arrays.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
    },
    async ({ slug, tracking_number }) => {
      try {
        const notification = await client.getNotification(slug, tracking_number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  slug,
                  tracking_number,
                  notification,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Notification by ID
  // ===========================================================================
  server.tool(
    'aftership_get_notification_by_id',
    `Get notification settings for a tracking by AfterShip ID.

Args:
  - id: AfterShip tracking ID (required)

Returns:
  Notification object with emails and smses arrays.`,
    {
      id: z.string().describe('AfterShip tracking ID (required)'),
    },
    async ({ id }) => {
      try {
        const notification = await client.getNotificationById(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  id,
                  notification,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Notification
  // ===========================================================================
  server.tool(
    'aftership_add_notification',
    `Add notification receivers to a tracking.

Adds email addresses and/or phone numbers to receive tracking updates.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)
  - emails: Array of email addresses to add
  - smses: Array of phone numbers to add (with country code, e.g., +1234567890)

Returns:
  Updated notification object.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
      emails: z.array(z.string()).optional().describe('Email addresses to add'),
      smses: z.array(z.string()).optional().describe('Phone numbers to add'),
    },
    async ({ slug, tracking_number, emails, smses }) => {
      try {
        const notification = await client.addNotification(slug, tracking_number, {
          emails,
          smses,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Notification receivers added',
                  slug,
                  tracking_number,
                  notification,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Notification by ID
  // ===========================================================================
  server.tool(
    'aftership_add_notification_by_id',
    `Add notification receivers to a tracking by AfterShip ID.

Args:
  - id: AfterShip tracking ID (required)
  - emails: Array of email addresses to add
  - smses: Array of phone numbers to add

Returns:
  Updated notification object.`,
    {
      id: z.string().describe('AfterShip tracking ID (required)'),
      emails: z.array(z.string()).optional().describe('Email addresses to add'),
      smses: z.array(z.string()).optional().describe('Phone numbers to add'),
    },
    async ({ id, emails, smses }) => {
      try {
        const notification = await client.addNotificationById(id, { emails, smses });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Notification receivers added',
                  id,
                  notification,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Notification
  // ===========================================================================
  server.tool(
    'aftership_remove_notification',
    `Remove notification receivers from a tracking.

Removes specified email addresses and/or phone numbers from receiving tracking updates.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)
  - emails: Array of email addresses to remove
  - smses: Array of phone numbers to remove

Returns:
  Updated notification object.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
      emails: z.array(z.string()).optional().describe('Email addresses to remove'),
      smses: z.array(z.string()).optional().describe('Phone numbers to remove'),
    },
    async ({ slug, tracking_number, emails, smses }) => {
      try {
        const notification = await client.removeNotification(slug, tracking_number, {
          emails,
          smses,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Notification receivers removed',
                  slug,
                  tracking_number,
                  notification,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Notification by ID
  // ===========================================================================
  server.tool(
    'aftership_remove_notification_by_id',
    `Remove notification receivers from a tracking by AfterShip ID.

Args:
  - id: AfterShip tracking ID (required)
  - emails: Array of email addresses to remove
  - smses: Array of phone numbers to remove

Returns:
  Updated notification object.`,
    {
      id: z.string().describe('AfterShip tracking ID (required)'),
      emails: z.array(z.string()).optional().describe('Email addresses to remove'),
      smses: z.array(z.string()).optional().describe('Phone numbers to remove'),
    },
    async ({ id, emails, smses }) => {
      try {
        const notification = await client.removeNotificationById(id, { emails, smses });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Notification receivers removed',
                  id,
                  notification,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
