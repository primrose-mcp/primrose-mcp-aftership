/**
 * AfterShip MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports stateless mode for multi-tenant deployments.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (API keys) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-AfterShip-API-Key: API key for AfterShip authentication
 *
 * Optional Headers:
 * - X-AfterShip-Base-URL: Override the default AfterShip API base URL
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createAfterShipClient } from './client.js';
import {
  registerCheckpointTools,
  registerCourierTools,
  registerEDDTools,
  registerNotificationTools,
  registerTrackingTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-aftership';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode instead.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class AfterShipMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-AfterShip-API-Key header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createAfterShipClient(credentials);

  // Register all AfterShip tools
  registerTrackingTools(server, client);
  registerCourierTools(server, client);
  registerNotificationTools(server, client);
  registerCheckpointTools(server, client);
  registerEDDTools(server, client);

  // Test connection tool
  server.tool(
    'aftership_test_connection',
    'Test the connection to the AfterShip API',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-AfterShip-API-Key'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'AfterShip MCP Server - Multi-tenant shipment tracking',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-AfterShip-API-Key': 'API key for AfterShip authentication',
          },
          optional_headers: {
            'X-AfterShip-Base-URL': 'Override the default AfterShip API base URL',
          },
        },
        tools: [
          'aftership_test_connection',
          'aftership_create_tracking',
          'aftership_get_tracking',
          'aftership_get_tracking_by_id',
          'aftership_list_trackings',
          'aftership_update_tracking',
          'aftership_delete_tracking',
          'aftership_retrack',
          'aftership_mark_as_completed',
          'aftership_list_couriers',
          'aftership_list_all_couriers',
          'aftership_detect_couriers',
          'aftership_get_notification',
          'aftership_get_notification_by_id',
          'aftership_add_notification',
          'aftership_add_notification_by_id',
          'aftership_remove_notification',
          'aftership_remove_notification_by_id',
          'aftership_get_last_checkpoint',
          'aftership_get_last_checkpoint_by_id',
          'aftership_predict_edd',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
