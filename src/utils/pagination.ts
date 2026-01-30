/**
 * Pagination Utilities
 *
 * Helpers for handling pagination across AfterShip API.
 */

import type { PaginatedResponse, PaginationParams } from '../types/entities.js';

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  limit: 20,
  maxLimit: 200,
} as const;

/**
 * Normalize pagination parameters
 */
export function normalizePaginationParams(
  params?: PaginationParams,
  maxLimit = PAGINATION_DEFAULTS.maxLimit
): Required<Pick<PaginationParams, 'limit'>> & Omit<PaginationParams, 'limit'> {
  return {
    limit: Math.min(params?.limit || PAGINATION_DEFAULTS.limit, maxLimit),
    cursor: params?.cursor,
    page: params?.page,
  };
}

/**
 * Create an empty paginated response
 */
export function emptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    items: [],
    count: 0,
    hasMore: false,
  };
}

/**
 * Create a paginated response from an array
 */
export function createPaginatedResponse<T>(
  items: T[],
  options: {
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
  } = {}
): PaginatedResponse<T> {
  return {
    items,
    count: items.length,
    total: options.total,
    hasMore: options.hasMore ?? false,
    nextCursor: options.nextCursor,
  };
}

/**
 * Calculate if there are more items based on page pagination
 */
export function hasMoreItems(currentPage: number, limit: number, count: number): boolean {
  return count === limit;
}

/**
 * Calculate next page for page-based pagination
 */
export function getNextPage(currentPage: number, limit: number, count: number): number | undefined {
  return count === limit ? currentPage + 1 : undefined;
}
