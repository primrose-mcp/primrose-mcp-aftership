/**
 * Courier Tools
 *
 * MCP tools for AfterShip courier management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AfterShipClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all courier-related tools
 */
export function registerCourierTools(server: McpServer, client: AfterShipClient): void {
  // ===========================================================================
  // List User Couriers
  // ===========================================================================
  server.tool(
    'aftership_list_couriers',
    `List couriers activated in your AfterShip account.

Returns a list of couriers that you have activated for your account.

Args:
  - format: Response format ('json' or 'markdown')

Returns:
  Array of courier objects with slug, name, phone, web_url, and required fields.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const couriers = await client.listCouriers();
        return formatResponse({ items: couriers, count: couriers.length, hasMore: false }, format, 'couriers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List All Couriers
  // ===========================================================================
  server.tool(
    'aftership_list_all_couriers',
    `List all couriers supported by AfterShip (over 1000+).

Returns the complete list of all couriers AfterShip supports, regardless of your account activation status.

Args:
  - format: Response format ('json' or 'markdown')

Returns:
  Array of all supported courier objects.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const couriers = await client.listAllCouriers();
        return formatResponse({ items: couriers, count: couriers.length, hasMore: false }, format, 'couriers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Detect Couriers
  // ===========================================================================
  server.tool(
    'aftership_detect_couriers',
    `Detect which couriers match a tracking number format.

Given a tracking number, returns a list of possible couriers that use that tracking number format.

Args:
  - tracking_number: The tracking number to detect (required)
  - tracking_postal_code: Postal code (helps narrow detection)
  - tracking_ship_date: Ship date in YYYYMMDD format
  - tracking_account_number: Account number with courier
  - tracking_destination_country: Destination country code
  - slug: Array of courier slugs to limit detection to

Returns:
  Array of detected courier objects with slug and name.`,
    {
      tracking_number: z.string().describe('Tracking number to detect (required)'),
      tracking_postal_code: z.string().optional().describe('Postal code'),
      tracking_ship_date: z.string().optional().describe('Ship date (YYYYMMDD)'),
      tracking_account_number: z.string().optional().describe('Account number with courier'),
      tracking_destination_country: z.string().optional().describe('Destination country code'),
      slug: z.array(z.string()).optional().describe('Limit detection to these courier slugs'),
    },
    async (params) => {
      try {
        const couriers = await client.detectCouriers(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tracking_number: params.tracking_number,
                  detected_count: couriers.length,
                  couriers,
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
