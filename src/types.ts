export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ClickEvent {
  appID: string;
  sessionID: string;
  where: string;
  target: string; // CSS selector or element label
  dateTime: string; // dd/MM/yyyy hh:mm AM/PM
}

export interface PageLoadEvent {
  appID: string;
  sessionID: string;
  where: string;
  timeOnPage: number; // ms
  dateTime: string; // dd/MM/yyyy hh:mm AM/PM
}

export interface HttpCallEvent {
  appID: string;
  sessionID: string;
  endpoint: string;
  method: HttpMethod;
  httpStatus: number;
  duration: number; // response time in ms
  dateTime: string; // dd/MM/yyyy hh:mm AM/PM
}

export interface Session {
  sessionID: string;
  appID: string;
  device: DeviceType;
  browser: string;
  referrer: string;
  startedAt: string; // dd/MM/yyyy hh:mm AM/PM
}

// Inputs accepted by the track functions: the timestamp is filled in by the lib
export type ClickEventInput = Omit<ClickEvent, 'dateTime'>;
export type PageLoadEventInput = Omit<PageLoadEvent, 'dateTime'>;
export type HttpCallEventInput = Omit<HttpCallEvent, 'dateTime'>;
export type SessionInput = Omit<Session, 'startedAt'>;

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
