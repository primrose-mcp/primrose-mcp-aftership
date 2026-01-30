/**
 * AfterShip API Client
 *
 * This file handles all HTTP communication with the AfterShip API.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different API keys.
 */

import type {
  AfterShipResponse,
  Courier,
  CourierDetectParams,
  CourierResponseData,
  DetectedCourier,
  DetectCourierResponseData,
  EDDBatchPredictResponseData,
  EDDPredictInput,
  EDDPrediction,
  LastCheckpoint,
  LastCheckpointParams,
  LastCheckpointResponseData,
  Notification,
  NotificationResponseData,
  PaginatedResponse,
  Tracking,
  TrackingCompletedStatus,
  TrackingCreateInput,
  TrackingGetParams,
  TrackingListParams,
  TrackingResponseData,
  TrackingsListResponseData,
  TrackingUpdateInput,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AfterShipApiError, AuthenticationError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Base URL for the AfterShip API v4
 */
const API_BASE_URL = 'https://api.aftership.com/v4';

// =============================================================================
// AfterShip Client Interface
// =============================================================================

export interface AfterShipClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Trackings
  createTracking(input: TrackingCreateInput): Promise<Tracking>;
  getTracking(slug: string, trackingNumber: string, params?: TrackingGetParams): Promise<Tracking>;
  getTrackingById(id: string, params?: TrackingGetParams): Promise<Tracking>;
  listTrackings(params?: TrackingListParams): Promise<PaginatedResponse<Tracking>>;
  updateTracking(
    slug: string,
    trackingNumber: string,
    input: TrackingUpdateInput
  ): Promise<Tracking>;
  updateTrackingById(id: string, input: TrackingUpdateInput): Promise<Tracking>;
  deleteTracking(slug: string, trackingNumber: string): Promise<Tracking>;
  deleteTrackingById(id: string): Promise<Tracking>;
  retrack(slug: string, trackingNumber: string): Promise<Tracking>;
  retrackById(id: string): Promise<Tracking>;
  markAsCompleted(
    slug: string,
    trackingNumber: string,
    reason: TrackingCompletedStatus
  ): Promise<Tracking>;
  markAsCompletedById(id: string, reason: TrackingCompletedStatus): Promise<Tracking>;

  // Couriers
  listCouriers(): Promise<Courier[]>;
  listAllCouriers(): Promise<Courier[]>;
  detectCouriers(params: CourierDetectParams): Promise<DetectedCourier[]>;

  // Notifications
  getNotification(slug: string, trackingNumber: string): Promise<Notification>;
  getNotificationById(id: string): Promise<Notification>;
  addNotification(
    slug: string,
    trackingNumber: string,
    notification: Notification
  ): Promise<Notification>;
  addNotificationById(id: string, notification: Notification): Promise<Notification>;
  removeNotification(
    slug: string,
    trackingNumber: string,
    notification: Notification
  ): Promise<Notification>;
  removeNotificationById(id: string, notification: Notification): Promise<Notification>;

  // Last Checkpoint
  getLastCheckpoint(
    slug: string,
    trackingNumber: string,
    params?: LastCheckpointParams
  ): Promise<LastCheckpoint>;
  getLastCheckpointById(id: string, params?: LastCheckpointParams): Promise<LastCheckpoint>;

  // Estimated Delivery Date
  predictEDD(inputs: EDDPredictInput[]): Promise<EDDPrediction[]>;
}

// =============================================================================
// AfterShip Client Implementation
// =============================================================================

class AfterShipClientImpl implements AfterShipClient {
  private credentials: TenantCredentials;
  private baseUrl: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl || API_BASE_URL;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.apiKey) {
      throw new AuthenticationError(
        'No credentials provided. Include X-AfterShip-API-Key header.'
      );
    }

    return {
      'aftership-api-key': this.credentials.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your API credentials.');
    }

    // Parse response body
    const body = (await response.json()) as AfterShipResponse<T>;

    // Handle API errors from response body
    if (body.meta.code !== 200 && body.meta.code !== 201) {
      throw new AfterShipApiError(
        body.meta.message || `API error: ${body.meta.code}`,
        body.meta.code,
        body.meta.type
      );
    }

    return body.data;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      // Use listCouriers as a simple connectivity test
      await this.request<CourierResponseData>('/couriers');
      return { connected: true, message: 'Successfully connected to AfterShip API' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Trackings
  // ===========================================================================

  async createTracking(input: TrackingCreateInput): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>('/trackings', {
      method: 'POST',
      body: JSON.stringify({ tracking: input }),
    });
    return data.tracking;
  }

  async getTracking(
    slug: string,
    trackingNumber: string,
    params?: TrackingGetParams
  ): Promise<Tracking> {
    const queryParams = new URLSearchParams();
    if (params?.fields) queryParams.set('fields', params.fields);
    if (params?.lang) queryParams.set('lang', params.lang);

    const query = queryParams.toString();
    const endpoint = `/trackings/${slug}/${trackingNumber}${query ? `?${query}` : ''}`;

    const data = await this.request<TrackingResponseData>(endpoint);
    return data.tracking;
  }

  async getTrackingById(id: string, params?: TrackingGetParams): Promise<Tracking> {
    const queryParams = new URLSearchParams();
    if (params?.fields) queryParams.set('fields', params.fields);
    if (params?.lang) queryParams.set('lang', params.lang);

    const query = queryParams.toString();
    const endpoint = `/trackings/${id}${query ? `?${query}` : ''}`;

    const data = await this.request<TrackingResponseData>(endpoint);
    return data.tracking;
  }

  async listTrackings(params?: TrackingListParams): Promise<PaginatedResponse<Tracking>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.slug) queryParams.set('slug', params.slug);
    if (params?.tag) queryParams.set('tag', params.tag);
    if (params?.keyword) queryParams.set('keyword', params.keyword);
    if (params?.created_at_min) queryParams.set('created_at_min', params.created_at_min);
    if (params?.created_at_max) queryParams.set('created_at_max', params.created_at_max);
    if (params?.updated_at_min) queryParams.set('updated_at_min', params.updated_at_min);
    if (params?.updated_at_max) queryParams.set('updated_at_max', params.updated_at_max);
    if (params?.tracking_numbers) queryParams.set('tracking_numbers', params.tracking_numbers);
    if (params?.origin) queryParams.set('origin', params.origin);
    if (params?.destination) queryParams.set('destination', params.destination);
    if (params?.return_to_sender !== undefined)
      queryParams.set('return_to_sender', String(params.return_to_sender));
    if (params?.fields) queryParams.set('fields', params.fields);
    if (params?.lang) queryParams.set('lang', params.lang);

    const query = queryParams.toString();
    const endpoint = `/trackings${query ? `?${query}` : ''}`;

    const data = await this.request<TrackingsListResponseData>(endpoint);

    const currentPage = data.page || 1;
    const limit = data.limit || 100;
    const hasMore = data.trackings.length === limit;

    return {
      items: data.trackings,
      count: data.count,
      hasMore,
      nextCursor: hasMore ? String(currentPage + 1) : undefined,
    };
  }

  async updateTracking(
    slug: string,
    trackingNumber: string,
    input: TrackingUpdateInput
  ): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(
      `/trackings/${slug}/${trackingNumber}`,
      {
        method: 'PUT',
        body: JSON.stringify({ tracking: input }),
      }
    );
    return data.tracking;
  }

  async updateTrackingById(id: string, input: TrackingUpdateInput): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(`/trackings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ tracking: input }),
    });
    return data.tracking;
  }

  async deleteTracking(slug: string, trackingNumber: string): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(
      `/trackings/${slug}/${trackingNumber}`,
      { method: 'DELETE' }
    );
    return data.tracking;
  }

  async deleteTrackingById(id: string): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(`/trackings/${id}`, {
      method: 'DELETE',
    });
    return data.tracking;
  }

  async retrack(slug: string, trackingNumber: string): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(
      `/trackings/${slug}/${trackingNumber}/retrack`,
      { method: 'POST' }
    );
    return data.tracking;
  }

  async retrackById(id: string): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(`/trackings/${id}/retrack`, {
      method: 'POST',
    });
    return data.tracking;
  }

  async markAsCompleted(
    slug: string,
    trackingNumber: string,
    reason: TrackingCompletedStatus
  ): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(
      `/trackings/${slug}/${trackingNumber}/mark-as-completed`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return data.tracking;
  }

  async markAsCompletedById(id: string, reason: TrackingCompletedStatus): Promise<Tracking> {
    const data = await this.request<TrackingResponseData>(
      `/trackings/${id}/mark-as-completed`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return data.tracking;
  }

  // ===========================================================================
  // Couriers
  // ===========================================================================

  async listCouriers(): Promise<Courier[]> {
    const data = await this.request<CourierResponseData>('/couriers');
    return data.couriers;
  }

  async listAllCouriers(): Promise<Courier[]> {
    const data = await this.request<CourierResponseData>('/couriers/all');
    return data.couriers;
  }

  async detectCouriers(params: CourierDetectParams): Promise<DetectedCourier[]> {
    const data = await this.request<DetectCourierResponseData>('/couriers/detect', {
      method: 'POST',
      body: JSON.stringify({ tracking: params }),
    });
    return data.couriers;
  }

  // ===========================================================================
  // Notifications
  // ===========================================================================

  async getNotification(slug: string, trackingNumber: string): Promise<Notification> {
    const data = await this.request<NotificationResponseData>(
      `/notifications/${slug}/${trackingNumber}`
    );
    return data.notification;
  }

  async getNotificationById(id: string): Promise<Notification> {
    const data = await this.request<NotificationResponseData>(`/notifications/${id}`);
    return data.notification;
  }

  async addNotification(
    slug: string,
    trackingNumber: string,
    notification: Notification
  ): Promise<Notification> {
    const data = await this.request<NotificationResponseData>(
      `/notifications/${slug}/${trackingNumber}/add`,
      {
        method: 'POST',
        body: JSON.stringify({ notification }),
      }
    );
    return data.notification;
  }

  async addNotificationById(id: string, notification: Notification): Promise<Notification> {
    const data = await this.request<NotificationResponseData>(`/notifications/${id}/add`, {
      method: 'POST',
      body: JSON.stringify({ notification }),
    });
    return data.notification;
  }

  async removeNotification(
    slug: string,
    trackingNumber: string,
    notification: Notification
  ): Promise<Notification> {
    const data = await this.request<NotificationResponseData>(
      `/notifications/${slug}/${trackingNumber}/remove`,
      {
        method: 'POST',
        body: JSON.stringify({ notification }),
      }
    );
    return data.notification;
  }

  async removeNotificationById(id: string, notification: Notification): Promise<Notification> {
    const data = await this.request<NotificationResponseData>(`/notifications/${id}/remove`, {
      method: 'POST',
      body: JSON.stringify({ notification }),
    });
    return data.notification;
  }

  // ===========================================================================
  // Last Checkpoint
  // ===========================================================================

  async getLastCheckpoint(
    slug: string,
    trackingNumber: string,
    params?: LastCheckpointParams
  ): Promise<LastCheckpoint> {
    const queryParams = new URLSearchParams();
    if (params?.fields) queryParams.set('fields', params.fields);
    if (params?.lang) queryParams.set('lang', params.lang);

    const query = queryParams.toString();
    const endpoint = `/last_checkpoint/${slug}/${trackingNumber}${query ? `?${query}` : ''}`;

    const data = await this.request<LastCheckpointResponseData>(endpoint);
    return {
      id: data.id,
      tracking_number: data.tracking_number,
      slug: data.slug,
      tag: data.tag,
      checkpoint: data.checkpoint,
    };
  }

  async getLastCheckpointById(id: string, params?: LastCheckpointParams): Promise<LastCheckpoint> {
    const queryParams = new URLSearchParams();
    if (params?.fields) queryParams.set('fields', params.fields);
    if (params?.lang) queryParams.set('lang', params.lang);

    const query = queryParams.toString();
    const endpoint = `/last_checkpoint/${id}${query ? `?${query}` : ''}`;

    const data = await this.request<LastCheckpointResponseData>(endpoint);
    return {
      id: data.id,
      tracking_number: data.tracking_number,
      slug: data.slug,
      tag: data.tag,
      checkpoint: data.checkpoint,
    };
  }

  // ===========================================================================
  // Estimated Delivery Date
  // ===========================================================================

  async predictEDD(inputs: EDDPredictInput[]): Promise<EDDPrediction[]> {
    const data = await this.request<EDDBatchPredictResponseData>(
      '/estimated-delivery-date/predict-batch',
      {
        method: 'POST',
        body: JSON.stringify({ estimated_delivery_dates: inputs }),
      }
    );
    return data.estimated_delivery_dates;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create an AfterShip client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createAfterShipClient(credentials: TenantCredentials): AfterShipClient {
  return new AfterShipClientImpl(credentials);
}
