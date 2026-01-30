/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  Courier,
  PaginatedResponse,
  ResponseFormat,
  Tracking,
  Checkpoint,
} from '../types/entities.js';
import { AfterShipApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof AfterShipApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  if (data.total !== undefined) {
    lines.push(`**Total:** ${data.total} | **Showing:** ${data.count}`);
  } else {
    lines.push(`**Showing:** ${data.count}`);
  }

  if (data.hasMore) {
    lines.push(`**More available:** Yes (page: \`${data.nextCursor}\`)`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'trackings':
      lines.push(formatTrackingsTable(data.items as Tracking[]));
      break;
    case 'couriers':
      lines.push(formatCouriersTable(data.items as Courier[]));
      break;
    case 'checkpoints':
      lines.push(formatCheckpointsTable(data.items as Checkpoint[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format trackings as Markdown table
 */
function formatTrackingsTable(trackings: Tracking[]): string {
  const lines: string[] = [];
  lines.push('| ID | Tracking # | Courier | Status | Title |');
  lines.push('|---|---|---|---|---|');

  for (const tracking of trackings) {
    lines.push(
      `| ${tracking.id} | ${tracking.tracking_number} | ${tracking.slug} | ${tracking.tag} | ${tracking.title || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format couriers as Markdown table
 */
function formatCouriersTable(couriers: Courier[]): string {
  const lines: string[] = [];
  lines.push('| Slug | Name | Phone | Web URL |');
  lines.push('|---|---|---|---|');

  for (const courier of couriers) {
    lines.push(
      `| ${courier.slug} | ${courier.name} | ${courier.phone || '-'} | ${courier.web_url || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format checkpoints as Markdown table
 */
function formatCheckpointsTable(checkpoints: Checkpoint[]): string {
  const lines: string[] = [];
  lines.push('| Time | Status | Message | Location |');
  lines.push('|---|---|---|---|');

  for (const checkpoint of checkpoints) {
    const location = [checkpoint.city, checkpoint.state, checkpoint.country_name]
      .filter(Boolean)
      .join(', ') || '-';
    lines.push(
      `| ${checkpoint.checkpoint_time || '-'} | ${checkpoint.tag || '-'} | ${checkpoint.message || '-'} | ${location} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  switch (entityType) {
    case 'trackings':
      return formatTrackingsTable(data as Tracking[]);
    case 'couriers':
      return formatCouriersTable(data as Courier[]);
    case 'checkpoints':
      return formatCheckpointsTable(data as Checkpoint[]);
    default:
      return formatGenericTable(data);
  }
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (snake_case to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
