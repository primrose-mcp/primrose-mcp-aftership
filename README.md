# AfterShip MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with AfterShip. Track shipments, manage couriers, configure notifications, and monitor delivery status across 1,000+ carriers worldwide.

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-6366f1)](https://primrose.dev/mcp/aftership)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[View on Primrose](https://primrose.dev/mcp/aftership)** | **[Documentation](https://primrose.dev/docs)**

---

## Features

- **Trackings** - Create, retrieve, update, and delete shipment trackings
- **Couriers** - List and detect courier services for tracking numbers
- **Notifications** - Configure email and SMS delivery notifications
- **Checkpoints** - Access detailed checkpoint and tracking history
- **Estimated Delivery** - Get estimated delivery dates and predictions

## Quick Start

### Using Primrose SDK (Recommended)

The fastest way to get started is with the [Primrose SDK](https://github.com/primrose-mcp/primrose-sdk), which handles authentication and provides tool definitions formatted for your LLM provider.

```bash
npm install primrose-mcp
```

```typescript
import { Primrose } from 'primrose-mcp';

const primrose = new Primrose({
  apiKey: 'prm_xxxxx',
  provider: 'anthropic', // or 'openai', 'google', 'amazon', etc.
});

// List available AfterShip tools
const tools = await primrose.listTools({ mcpServer: 'aftership' });

// Call a tool
const result = await primrose.callTool('aftership_create_tracking', {
  tracking_number: '1Z999AA10123456784',
  slug: 'ups'
});
```

[Get your Primrose API key](https://primrose.dev) to start building.

### Manual Installation

If you prefer to self-host, you can deploy this MCP server directly to Cloudflare Workers.

```bash
git clone https://github.com/primrose-mcp/primrose-mcp-aftership.git
cd primrose-mcp-aftership
bun install
bun run deploy
```

## Configuration

This server uses a multi-tenant architecture where credentials are passed via request headers.

### Required Headers

| Header | Description |
|--------|-------------|
| `X-AfterShip-API-Key` | Your AfterShip API key |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-AfterShip-Base-URL` | Override the default AfterShip API base URL |

### Getting Credentials

1. Log in to your [AfterShip account](https://admin.aftership.com/)
2. Navigate to Settings > API Keys
3. Generate a new API key with appropriate permissions

## Available Tools

### Trackings
- `aftership_create_tracking` - Create a new tracking
- `aftership_get_tracking` - Get tracking by slug and number
- `aftership_list_trackings` - List all trackings with filters
- `aftership_update_tracking` - Update tracking metadata
- `aftership_delete_tracking` - Delete a tracking

### Couriers
- `aftership_list_couriers` - List all supported couriers
- `aftership_detect_couriers` - Detect courier from tracking number

### Notifications
- `aftership_get_notification` - Get notification settings
- `aftership_update_notification` - Update notification settings

### Checkpoints
- `aftership_get_checkpoints` - Get tracking checkpoints

### Estimated Delivery
- `aftership_get_estimated_delivery` - Get delivery estimates

## Development

```bash
bun run dev
bun run typecheck
bun run lint
bun run inspector
```

## Related Resources

- [Primrose SDK](https://github.com/primrose-mcp/primrose-sdk)
- [AfterShip API Documentation](https://www.aftership.com/docs/tracking/overview)
- [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT License - see [LICENSE](LICENSE) for details.
