/**
 * Estimated Delivery Date Tools
 *
 * MCP tools for AfterShip EDD (Estimated Delivery Date) predictions.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AfterShipClient } from '../client.js';
import type { EDDPredictInput } from '../types/entities.js';
import { formatError } from '../utils/formatters.js';

/**
 * Register all EDD-related tools
 */
export function registerEDDTools(server: McpServer, client: AfterShipClient): void {
  // ===========================================================================
  // Predict Estimated Delivery Date
  // ===========================================================================
  server.tool(
    'aftership_predict_edd',
    `Predict estimated delivery dates for shipments.

Uses AfterShip's AI-powered predictive model to estimate when packages will be delivered.
Can predict for multiple shipments in a single request (max 5).

Args:
  - predictions: Array of prediction requests (1-5 items), each containing:
    - slug: Courier slug (required)
    - service_type_name: Service type name
    - origin_address: Origin address with country, state, and/or postal_code
    - destination_address: Destination address with country, state, and/or postal_code
    - weight: Weight object with unit ('kg' or 'lb') and value
    - pickup_time: Local pickup time (ISO 8601) OR
    - estimated_pickup: Estimated pickup date (YYYY-MM-DD)

Note: Either pickup_time or estimated_pickup is required for each prediction.
Either origin_address.state or origin_address.postal_code is required.
Either destination_address.state or destination_address.postal_code is required.

Returns:
  Array of prediction results with estimated_delivery_date, estimated_delivery_date_max, and confidence_score.`,
    {
      predictions: z
        .array(
          z.object({
            slug: z.string().describe('Courier slug (required)'),
            service_type_name: z.string().optional().describe('Service type name'),
            origin_address: z
              .object({
                country: z.string().optional().describe('Origin country ISO3 code'),
                state: z.string().optional().describe('Origin state/province'),
                postal_code: z.string().optional().describe('Origin postal code'),
              })
              .optional()
              .describe('Origin address'),
            destination_address: z
              .object({
                country: z.string().optional().describe('Destination country ISO3 code'),
                state: z.string().optional().describe('Destination state/province'),
                postal_code: z.string().optional().describe('Destination postal code'),
              })
              .optional()
              .describe('Destination address'),
            weight: z
              .object({
                unit: z.enum(['kg', 'lb']).optional().describe('Weight unit'),
                value: z.number().optional().describe('Weight value'),
              })
              .optional()
              .describe('Package weight'),
            pickup_time: z.string().optional().describe('Local pickup time (ISO 8601)'),
            estimated_pickup: z.string().optional().describe('Estimated pickup date (YYYY-MM-DD)'),
          })
        )
        .min(1)
        .max(5)
        .describe('Array of prediction requests (1-5)'),
    },
    async ({ predictions }) => {
      try {
        const inputs: EDDPredictInput[] = predictions.map((p) => ({
          slug: p.slug,
          service_type_name: p.service_type_name,
          origin_address: p.origin_address,
          destination_address: p.destination_address,
          weight: p.weight,
          pickup_time: p.pickup_time,
          estimated_pickup: p.estimated_pickup,
        }));

        const results = await client.predictEDD(inputs);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  count: results.length,
                  predictions: results,
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
