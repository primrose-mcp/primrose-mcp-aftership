/**
 * Tracking Tools
 *
 * MCP tools for AfterShip tracking management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AfterShipClient } from '../client.js';
import type { TrackingCompletedStatus, TrackingTag } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all tracking-related tools
 */
export function registerTrackingTools(server: McpServer, client: AfterShipClient): void {
  // ===========================================================================
  // Create Tracking
  // ===========================================================================
  server.tool(
    'aftership_create_tracking',
    `Create a new tracking in AfterShip.

Args:
  - tracking_number: The tracking number (required)
  - slug: Courier slug (e.g., 'ups', 'fedex', 'usps')
  - title: A title for this tracking
  - customer_name: Customer name
  - order_id: Order ID
  - order_number: Order number
  - emails: Array of email addresses for notifications
  - smses: Array of phone numbers for SMS notifications
  - custom_fields: Custom key-value pairs

Returns:
  The created tracking object.`,
    {
      tracking_number: z.string().describe('Tracking number (required)'),
      slug: z.string().optional().describe('Courier slug (e.g., ups, fedex, usps)'),
      title: z.string().optional().describe('Title for the tracking'),
      customer_name: z.string().optional().describe('Customer name'),
      order_id: z.string().optional().describe('Order ID'),
      order_number: z.string().optional().describe('Order number'),
      emails: z.array(z.string()).optional().describe('Email addresses for notifications'),
      smses: z.array(z.string()).optional().describe('Phone numbers for SMS notifications'),
      custom_fields: z
        .record(z.string(), z.string())
        .optional()
        .describe('Custom fields as key-value pairs'),
    },
    async (input) => {
      try {
        const tracking = await client.createTracking(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Tracking created', tracking },
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
  // Get Tracking
  // ===========================================================================
  server.tool(
    'aftership_get_tracking',
    `Get a tracking by courier slug and tracking number.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)
  - fields: Comma-separated list of fields to return
  - lang: Language for checkpoint messages (e.g., 'en')
  - format: Response format ('json' or 'markdown')

Returns:
  The tracking object with checkpoints.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
      fields: z.string().optional().describe('Comma-separated list of fields to return'),
      lang: z.string().optional().describe('Language for checkpoint messages'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ slug, tracking_number, fields, lang, format }) => {
      try {
        const tracking = await client.getTracking(slug, tracking_number, { fields, lang });
        return formatResponse(tracking, format, 'tracking');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Tracking by ID
  // ===========================================================================
  server.tool(
    'aftership_get_tracking_by_id',
    `Get a tracking by its AfterShip ID.

Args:
  - id: AfterShip tracking ID (required)
  - fields: Comma-separated list of fields to return
  - lang: Language for checkpoint messages
  - format: Response format

Returns:
  The tracking object with checkpoints.`,
    {
      id: z.string().describe('AfterShip tracking ID (required)'),
      fields: z.string().optional().describe('Comma-separated list of fields to return'),
      lang: z.string().optional().describe('Language for checkpoint messages'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, fields, lang, format }) => {
      try {
        const tracking = await client.getTrackingById(id, { fields, lang });
        return formatResponse(tracking, format, 'tracking');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Trackings
  // ===========================================================================
  server.tool(
    'aftership_list_trackings',
    `List trackings with optional filters.

Args:
  - page: Page number (1-indexed)
  - limit: Number of trackings per page (max 200)
  - slug: Filter by courier slug
  - tag: Filter by status tag (Pending, InTransit, Delivered, etc.)
  - keyword: Search keyword
  - created_at_min: Filter by created date (ISO 8601)
  - created_at_max: Filter by created date (ISO 8601)
  - origin: Filter by origin country
  - destination: Filter by destination country
  - format: Response format

Status tags: Pending, InfoReceived, InTransit, OutForDelivery, AttemptFail, Delivered, AvailableForPickup, Exception, Expired

Returns:
  Paginated list of trackings.`,
    {
      page: z.number().int().min(1).optional().describe('Page number (1-indexed)'),
      limit: z.number().int().min(1).max(200).optional().describe('Number per page (max 200)'),
      slug: z.string().optional().describe('Filter by courier slug'),
      tag: z
        .enum([
          'Pending',
          'InfoReceived',
          'InTransit',
          'OutForDelivery',
          'AttemptFail',
          'Delivered',
          'AvailableForPickup',
          'Exception',
          'Expired',
        ])
        .optional()
        .describe('Filter by status tag'),
      keyword: z.string().optional().describe('Search keyword'),
      created_at_min: z.string().optional().describe('Created after (ISO 8601)'),
      created_at_max: z.string().optional().describe('Created before (ISO 8601)'),
      origin: z.string().optional().describe('Filter by origin country'),
      destination: z.string().optional().describe('Filter by destination country'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, tag, ...params }) => {
      try {
        const result = await client.listTrackings({
          ...params,
          tag: tag as TrackingTag | undefined,
        });
        return formatResponse(result, format, 'trackings');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Tracking
  // ===========================================================================
  server.tool(
    'aftership_update_tracking',
    `Update a tracking by courier slug and tracking number.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)
  - title: New title
  - customer_name: New customer name
  - order_id: New order ID
  - order_number: New order number
  - emails: New email addresses for notifications
  - smses: New phone numbers for SMS
  - custom_fields: New custom fields

Returns:
  The updated tracking object.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
      title: z.string().optional().describe('New title'),
      customer_name: z.string().optional().describe('New customer name'),
      order_id: z.string().optional().describe('New order ID'),
      order_number: z.string().optional().describe('New order number'),
      emails: z.array(z.string()).optional().describe('New email addresses'),
      smses: z.array(z.string()).optional().describe('New phone numbers'),
      custom_fields: z.record(z.string(), z.string()).optional().describe('New custom fields'),
    },
    async ({ slug, tracking_number, ...input }) => {
      try {
        const tracking = await client.updateTracking(slug, tracking_number, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Tracking updated', tracking },
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
  // Delete Tracking
  // ===========================================================================
  server.tool(
    'aftership_delete_tracking',
    `Delete a tracking by courier slug and tracking number.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)

Returns:
  Confirmation of deletion.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
    },
    async ({ slug, tracking_number }) => {
      try {
        const tracking = await client.deleteTracking(slug, tracking_number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Tracking ${tracking_number} deleted`,
                  tracking,
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
  // Retrack
  // ===========================================================================
  server.tool(
    'aftership_retrack',
    `Retrack an expired tracking. Can be called up to 3 times per tracking.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)

Returns:
  The retracked tracking object.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
    },
    async ({ slug, tracking_number }) => {
      try {
        const tracking = await client.retrack(slug, tracking_number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Tracking retracked', tracking },
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
  // Mark as Completed
  // ===========================================================================
  server.tool(
    'aftership_mark_as_completed',
    `Mark a tracking as completed with a specific reason.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)
  - reason: Completion reason (required): DELIVERED, LOST, or RETURNED_TO_SENDER

Returns:
  The updated tracking object.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
      reason: z
        .enum(['DELIVERED', 'LOST', 'RETURNED_TO_SENDER'])
        .describe('Completion reason (required)'),
    },
    async ({ slug, tracking_number, reason }) => {
      try {
        const tracking = await client.markAsCompleted(
          slug,
          tracking_number,
          reason as TrackingCompletedStatus
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Tracking marked as ${reason}`, tracking },
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
