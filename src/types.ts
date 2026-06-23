export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type EventType = 'click' | 'pageview';

// Unified event with discriminated union
export interface BaseEvent {
  appID: string;
  sessionID: string;
  timestamp: string; // ISO 8601 format stored as string, converted to Date on backend
  location: string; // URL path without domain/query/fragment
}

export interface ClickEvent extends BaseEvent {
  type: 'click';
  element?: string; // CSS selector or element label
}

export interface PageViewEvent extends BaseEvent {
  type: 'pageview';
  timeOnPage: number; // milliseconds
}

export type Event = ClickEvent | PageViewEvent;

export interface HttpCallEvent {
  appID: string;
  sessionID: string;
  timestamp: string; // ISO 8601 format
  endpoint: string;
  method: HttpMethod;
  status: number; // HTTP status code (200, 404, 500, etc.)
  duration: number; // response time in milliseconds
}

export interface SessionContext {
  device: DeviceType;
  browser: string;
  referrer: string; // stripped of query/fragment
  utmSource?: string; // marketing attribution (utm_source), optional
  utmMedium?: string; // marketing attribution (utm_medium), optional
  country?: string; // ISO country code, enriched server-side from edge geo
  city?: string; // city name, enriched server-side from edge geo
}

export interface Session {
  sessionID: string;
  appID: string;
  userID?: string; // optional, derived from fingerprint or explicit tracking
  context: SessionContext;
  startTime: string; // ISO 8601 format
  endTime?: string; // ISO 8601 format (optional, set on session end)
}

// Inputs accepted by the track functions: timestamp and the type
// discriminator are filled in by the lib
export type ClickEventInput = Omit<ClickEvent, 'timestamp' | 'type'>;
export type PageViewEventInput = Omit<PageViewEvent, 'timestamp' | 'type'>;
export type HttpCallEventInput = Omit<HttpCallEvent, 'timestamp'>;
export type SessionInput = Omit<Session, 'startTime' | 'endTime'>;

export interface AnalyticsError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: unknown;
  error?: AnalyticsError;
}
