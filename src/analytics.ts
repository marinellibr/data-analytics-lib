import {
  ClickEvent,
  ClickEventInput,
  PageViewEvent,
  PageViewEventInput,
  HttpCallEvent,
  HttpCallEventInput,
  Session,
  SessionInput,
  AnalyticsError,
  AnalyticsResponse,
} from './types';
import {
  getApiUrl,
  EVENTS_ENDPOINT,
  HTTP_CALLS_ENDPOINT,
  SESSIONS_ENDPOINT,
} from './config';
import { sanitizeUrl, truncate } from './sanitize';

const postEvent = async (endpoint: string, payload: unknown): Promise<AnalyticsResponse> => {
  try {
    const apiUrl = getApiUrl();
    const url = `${apiUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: AnalyticsError = {
        code: `HTTP_${response.status}`,
        message: data.message || `HTTP Error: ${response.status}`,
        details: data,
      };

      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    const error: AnalyticsError = {
      code: 'NETWORK_ERROR',
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      details: err,
    };

    return {
      success: false,
      error,
    };
  }

  // TODO: Add retry logic with exponential backoff
};

export const trackClick = (event: ClickEventInput): Promise<AnalyticsResponse> => {
  const payload: ClickEvent = {
    type: 'click',
    appID: truncate(event.appID),
    sessionID: truncate(event.sessionID),
    location: sanitizeUrl(event.location),
    element: event.element ? truncate(event.element) : undefined,
    timestamp: new Date().toISOString(),
  };
  return postEvent(EVENTS_ENDPOINT, payload);
};

export const trackPageLoad = (event: PageViewEventInput): Promise<AnalyticsResponse> => {
  const payload: PageViewEvent = {
    type: 'pageview',
    appID: truncate(event.appID),
    sessionID: truncate(event.sessionID),
    location: sanitizeUrl(event.location),
    timeOnPage: event.timeOnPage,
    timestamp: new Date().toISOString(),
  };
  return postEvent(EVENTS_ENDPOINT, payload);
};

export const trackHttpCall = (event: HttpCallEventInput): Promise<AnalyticsResponse> => {
  const payload: HttpCallEvent = {
    appID: truncate(event.appID),
    sessionID: truncate(event.sessionID),
    endpoint: sanitizeUrl(event.endpoint),
    method: event.method,
    status: event.status,
    duration: event.duration,
    timestamp: new Date().toISOString(),
  };
  return postEvent(HTTP_CALLS_ENDPOINT, payload);
};

export const trackSession = (session: SessionInput): Promise<AnalyticsResponse> => {
  const payload: Session = {
    sessionID: truncate(session.sessionID),
    appID: truncate(session.appID),
    userID: session.userID ? truncate(session.userID) : undefined,
    context: {
      device: session.context.device,
      browser: truncate(session.context.browser),
      referrer: sanitizeUrl(session.context.referrer),
    },
    startTime: new Date().toISOString(),
  };
  return postEvent(SESSIONS_ENDPOINT, payload);
};
