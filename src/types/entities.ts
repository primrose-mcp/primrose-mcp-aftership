/**
 * AfterShip Entity Types
 *
 * Type definitions for AfterShip API entities.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Number of items to return (max 200) */
  limit?: number;
  /** Page number for pagination (1-indexed) */
  page?: number;
  /** Cursor for pagination */
  cursor?: string;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Number of items in this response */
  count: number;
  /** Total count (if available) */
  total?: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Cursor for next page */
  nextCursor?: string;
}

// =============================================================================
// Tracking
// =============================================================================

/**
 * Tracking delivery status tags
 */
export type TrackingTag =
  | 'Pending'
  | 'InfoReceived'
  | 'InTransit'
  | 'OutForDelivery'
  | 'AttemptFail'
  | 'Delivered'
  | 'AvailableForPickup'
  | 'Exception'
  | 'Expired';

/**
 * Tracking completed status for mark as completed
 */
export type TrackingCompletedStatus = 'DELIVERED' | 'LOST' | 'RETURNED_TO_SENDER';

/**
 * Tracking object from AfterShip API
 */
export interface Tracking {
  /** Tracking ID (AfterShip internal ID) */
  id: string;
  /** Tracking number */
  tracking_number: string;
  /** Courier slug (e.g., 'ups', 'fedex', 'usps') */
  slug: string;
  /** Current status tag */
  tag: TrackingTag;
  /** Title for the tracking (optional) */
  title?: string;
  /** Customer name */
  customer_name?: string;
  /** Order ID */
  order_id?: string;
  /** Order ID path (URL) */
  order_id_path?: string;
  /** Order number */
  order_number?: string;
  /** Order date */
  order_date?: string;
  /** Shipment package count */
  shipment_package_count?: number;
  /** Origin country (ISO3) */
  origin_country_iso3?: string;
  /** Destination country (ISO3) */
  destination_country_iso3?: string;
  /** Destination city */
  destination_city?: string;
  /** Destination state */
  destination_state?: string;
  /** Destination postal code */
  destination_postal_code?: string;
  /** Destination raw location */
  destination_raw_location?: string;
  /** Tracking postal code */
  tracking_postal_code?: string;
  /** Tracking ship date */
  tracking_ship_date?: string;
  /** Tracking account number */
  tracking_account_number?: string;
  /** Tracking key */
  tracking_key?: string;
  /** Tracking origin country */
  tracking_origin_country?: string;
  /** Tracking destination country */
  tracking_destination_country?: string;
  /** Tracking state */
  tracking_state?: string;
  /** Signed by */
  signed_by?: string;
  /** Shipment type */
  shipment_type?: string;
  /** Shipment weight */
  shipment_weight?: number;
  /** Shipment weight unit */
  shipment_weight_unit?: string;
  /** Array of email addresses for notifications */
  emails?: string[];
  /** Array of phone numbers for SMS notifications */
  smses?: string[];
  /** Custom fields */
  custom_fields?: Record<string, string>;
  /** Note for the tracking */
  note?: string;
  /** Language for checkpoint messages */
  language?: string;
  /** Source of the tracking (api, web, csv) */
  source?: string;
  /** Active status */
  active?: boolean;
  /** Android devices for push notifications */
  android?: string[];
  /** iOS devices for push notifications */
  ios?: string[];
  /** Delivery time in days */
  delivery_time?: number;
  /** Expected delivery date */
  expected_delivery?: string;
  /** Shipment pickup date */
  shipment_pickup_date?: string;
  /** Shipment delivery date */
  shipment_delivery_date?: string;
  /** Courier tracking link */
  courier_tracking_link?: string;
  /** AfterShip tracking link */
  aftership_tracking_link?: string;
  /** First attempt date */
  first_attempted_at?: string;
  /** First estimated delivery date */
  first_estimated_delivery?: string;
  /** Latest estimated delivery date */
  latest_estimated_delivery?: string;
  /** Return to sender status */
  return_to_sender?: boolean;
  /** Array of checkpoints */
  checkpoints?: Checkpoint[];
  /** Created at timestamp */
  created_at?: string;
  /** Updated at timestamp */
  updated_at?: string;
}

/**
 * Input for creating a tracking
 */
export interface TrackingCreateInput {
  /** Tracking number (required) */
  tracking_number: string;
  /** Courier slug (recommended) */
  slug?: string;
  /** Title for the tracking */
  title?: string;
  /** Customer name */
  customer_name?: string;
  /** Order ID */
  order_id?: string;
  /** Order ID path (URL) */
  order_id_path?: string;
  /** Order number */
  order_number?: string;
  /** Order date */
  order_date?: string;
  /** Origin country (ISO3) */
  origin_country_iso3?: string;
  /** Destination country (ISO3) */
  destination_country_iso3?: string;
  /** Tracking postal code */
  tracking_postal_code?: string;
  /** Tracking ship date (YYYYMMDD) */
  tracking_ship_date?: string;
  /** Tracking account number */
  tracking_account_number?: string;
  /** Tracking key */
  tracking_key?: string;
  /** Tracking origin country */
  tracking_origin_country?: string;
  /** Tracking destination country */
  tracking_destination_country?: string;
  /** Tracking state */
  tracking_state?: string;
  /** Emails for notifications */
  emails?: string[];
  /** Phone numbers for SMS notifications */
  smses?: string[];
  /** Custom fields */
  custom_fields?: Record<string, string>;
  /** Note for the tracking */
  note?: string;
  /** Language for checkpoint messages (e.g., 'en') */
  language?: string;
  /** Android devices for push notifications */
  android?: string[];
  /** iOS devices for push notifications */
  ios?: string[];
}

/**
 * Input for updating a tracking
 */
export interface TrackingUpdateInput {
  /** Title for the tracking */
  title?: string;
  /** Customer name */
  customer_name?: string;
  /** Order ID */
  order_id?: string;
  /** Order ID path (URL) */
  order_id_path?: string;
  /** Order number */
  order_number?: string;
  /** Order date */
  order_date?: string;
  /** Destination country (ISO3) */
  destination_country_iso3?: string;
  /** Emails for notifications */
  emails?: string[];
  /** Phone numbers for SMS notifications */
  smses?: string[];
  /** Custom fields */
  custom_fields?: Record<string, string>;
  /** Note for the tracking */
  note?: string;
}

/**
 * Parameters for listing trackings
 */
export interface TrackingListParams extends PaginationParams {
  /** Filter by courier slug */
  slug?: string;
  /** Filter by status tag */
  tag?: TrackingTag;
  /** Keyword search */
  keyword?: string;
  /** Created after this date (ISO 8601) */
  created_at_min?: string;
  /** Created before this date (ISO 8601) */
  created_at_max?: string;
  /** Updated after this date (ISO 8601) */
  updated_at_min?: string;
  /** Updated before this date (ISO 8601) */
  updated_at_max?: string;
  /** Filter by tracking numbers (comma-separated) */
  tracking_numbers?: string;
  /** Filter by origin country */
  origin?: string;
  /** Filter by destination country */
  destination?: string;
  /** Filter by return to sender status */
  return_to_sender?: boolean;
  /** Comma-separated list of fields to return */
  fields?: string;
  /** Language for checkpoint messages */
  lang?: string;
}

/**
 * Parameters for getting a single tracking
 */
export interface TrackingGetParams {
  /** Comma-separated list of fields to return */
  fields?: string;
  /** Language for checkpoint messages */
  lang?: string;
}

// =============================================================================
// Checkpoint
// =============================================================================

/**
 * Checkpoint in a tracking
 */
export interface Checkpoint {
  /** Slug of the courier */
  slug?: string;
  /** Checkpoint time */
  checkpoint_time?: string;
  /** City */
  city?: string;
  /** Coordinates [lat, lng] */
  coordinates?: number[];
  /** Country ISO3 code */
  country_iso3?: string;
  /** Country name */
  country_name?: string;
  /** Checkpoint message */
  message?: string;
  /** State/province */
  state?: string;
  /** Status tag at this checkpoint */
  tag?: TrackingTag;
  /** Subtag for more detail */
  subtag?: string;
  /** Subtag message */
  subtag_message?: string;
  /** Zip/postal code */
  zip?: string;
  /** Raw location string */
  raw_tag?: string;
  /** Created at timestamp */
  created_at?: string;
}

/**
 * Last checkpoint response
 */
export interface LastCheckpoint {
  /** Tracking ID */
  id: string;
  /** Tracking number */
  tracking_number: string;
  /** Courier slug */
  slug: string;
  /** Current tag */
  tag: TrackingTag;
  /** The last checkpoint */
  checkpoint: Checkpoint;
}

/**
 * Parameters for getting last checkpoint
 */
export interface LastCheckpointParams {
  /** Comma-separated list of fields to return */
  fields?: string;
  /** Language for checkpoint messages */
  lang?: string;
}

// =============================================================================
// Courier
// =============================================================================

/**
 * Courier object from AfterShip API
 */
export interface Courier {
  /** Courier slug (unique identifier) */
  slug: string;
  /** Courier name */
  name: string;
  /** Phone number */
  phone?: string;
  /** Other name for the courier */
  other_name?: string;
  /** Web URL */
  web_url?: string;
  /** Required fields for creating tracking */
  required_fields?: string[];
  /** Optional fields for creating tracking */
  optional_fields?: string[];
  /** Default language */
  default_language?: string;
  /** Support languages */
  support_languages?: string[];
  /** Service from country */
  service_from_country_iso3?: string[];
}

/**
 * Courier list response
 */
export interface CourierList {
  /** Total count of couriers */
  total: number;
  /** Array of couriers */
  couriers: Courier[];
}

/**
 * Parameters for detecting couriers
 */
export interface CourierDetectParams {
  /** Tracking number (required) */
  tracking_number: string;
  /** Tracking postal code */
  tracking_postal_code?: string;
  /** Tracking ship date (YYYYMMDD) */
  tracking_ship_date?: string;
  /** Tracking account number */
  tracking_account_number?: string;
  /** Tracking key */
  tracking_key?: string;
  /** Tracking destination country */
  tracking_destination_country?: string;
  /** List of slugs to detect against */
  slug?: string[];
}

/**
 * Detected courier result
 */
export interface DetectedCourier {
  /** Courier slug */
  slug: string;
  /** Courier name */
  name: string;
}

// =============================================================================
// Notification
// =============================================================================

/**
 * Notification settings for a tracking
 */
export interface Notification {
  /** Array of email addresses */
  emails?: string[];
  /** Array of phone numbers for SMS */
  smses?: string[];
}

// =============================================================================
// Estimated Delivery Date
// =============================================================================

/**
 * Address for EDD prediction
 */
export interface EDDAddress {
  /** Country ISO3 code */
  country?: string;
  /** State/province */
  state?: string;
  /** Postal code */
  postal_code?: string;
}

/**
 * Weight object for EDD prediction
 */
export interface EDDWeight {
  /** Weight unit (kg, lb) */
  unit?: string;
  /** Weight value */
  value?: number;
}

/**
 * Input for EDD prediction
 */
export interface EDDPredictInput {
  /** Courier slug */
  slug: string;
  /** Service type name */
  service_type_name?: string;
  /** Origin address */
  origin_address?: EDDAddress;
  /** Destination address */
  destination_address?: EDDAddress;
  /** Weight */
  weight?: EDDWeight;
  /** Pickup time (ISO 8601) or estimated pickup (YYYY-MM-DD) */
  pickup_time?: string;
  estimated_pickup?: string;
}

/**
 * EDD prediction result
 */
export interface EDDPrediction {
  /** Courier slug */
  slug: string;
  /** Service type name */
  service_type_name?: string;
  /** Origin address */
  origin_address?: EDDAddress;
  /** Destination address */
  destination_address?: EDDAddress;
  /** Weight */
  weight?: EDDWeight;
  /** Pickup time */
  pickup_time?: string;
  /** Estimated delivery date (earliest) */
  estimated_delivery_date?: string;
  /** Estimated delivery date (latest) */
  estimated_delivery_date_max?: string;
  /** Confidence score (0-1) */
  confidence_score?: number;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';

// =============================================================================
// API Response Wrappers
// =============================================================================

/**
 * Standard AfterShip API response wrapper
 */
export interface AfterShipResponse<T> {
  meta: {
    code: number;
    message?: string;
    type?: string;
  };
  data: T;
}

/**
 * AfterShip tracking response data
 */
export interface TrackingResponseData {
  tracking: Tracking;
}

/**
 * AfterShip trackings list response data
 */
export interface TrackingsListResponseData {
  page: number;
  limit: number;
  count: number;
  keyword?: string;
  slug?: string;
  tag?: TrackingTag;
  trackings: Tracking[];
}

/**
 * AfterShip courier response data
 */
export interface CourierResponseData {
  total: number;
  couriers: Courier[];
}

/**
 * AfterShip detect courier response data
 */
export interface DetectCourierResponseData {
  total: number;
  couriers: DetectedCourier[];
}

/**
 * AfterShip notification response data
 */
export interface NotificationResponseData {
  notification: Notification;
}

/**
 * AfterShip last checkpoint response data
 */
export interface LastCheckpointResponseData {
  id: string;
  tracking_number: string;
  slug: string;
  tag: TrackingTag;
  checkpoint: Checkpoint;
}

/**
 * AfterShip EDD batch predict response data
 */
export interface EDDBatchPredictResponseData {
  estimated_delivery_dates: EDDPrediction[];
}
