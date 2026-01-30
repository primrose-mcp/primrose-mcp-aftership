/**
 * Checkpoint Tools
 *
 * MCP tools for AfterShip last checkpoint retrieval.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AfterShipClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all checkpoint-related tools
 */
export function registerCheckpointTools(server: McpServer, client: AfterShipClient): void {
  // ===========================================================================
  // Get Last Checkpoint
  // ===========================================================================
  server.tool(
    'aftership_get_last_checkpoint',
    `Get the last checkpoint for a tracking.

Returns the most recent checkpoint/status update for a tracking, which is more efficient than fetching the full tracking when you only need the current status.

Args:
  - slug: Courier slug (required)
  - tracking_number: Tracking number (required)
  - fields: Comma-separated list of checkpoint fields to return
    Available fields: slug, created_at, checkpoint_time, city, coordinates, country_iso3, country_name, message, state, tag, zip
  - lang: Language for checkpoint messages (e.g., 'en')
  - format: Response format ('json' or 'markdown')

Returns:
  Last checkpoint object with tracking info and the most recent checkpoint.`,
    {
      slug: z.string().describe('Courier slug (required)'),
      tracking_number: z.string().describe('Tracking number (required)'),
      fields: z.string().optional().describe('Comma-separated checkpoint fields'),
      lang: z.string().optional().describe('Language for checkpoint messages'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ slug, tracking_number, fields, lang, format }) => {
      try {
        const lastCheckpoint = await client.getLastCheckpoint(slug, tracking_number, {
          fields,
          lang,
        });
        return formatResponse(lastCheckpoint, format, 'checkpoint');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Last Checkpoint by ID
  // ===========================================================================
  server.tool(
    'aftership_get_last_checkpoint_by_id',
    `Get the last checkpoint for a tracking by AfterShip ID.

Args:
  - id: AfterShip tracking ID (required)
  - fields: Comma-separated list of checkpoint fields to return
  - lang: Language for checkpoint messages
  - format: Response format

Returns:
  Last checkpoint object with tracking info and the most recent checkpoint.`,
    {
      id: z.string().describe('AfterShip tracking ID (required)'),
      fields: z.string().optional().describe('Comma-separated checkpoint fields'),
      lang: z.string().optional().describe('Language for checkpoint messages'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ id, fields, lang, format }) => {
      try {
        const lastCheckpoint = await client.getLastCheckpointById(id, { fields, lang });
        return formatResponse(lastCheckpoint, format, 'checkpoint');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
