import {
  ClickEvent,
  ClickEventInput,
  PageLoadEvent,
  PageLoadEventInput,
  HttpCallEvent,
  HttpCallEventInput,
  Session,
  SessionInput,
  AnalyticsError,
  AnalyticsResponse,
} from './types';
import {
  getApiUrl,
  CLICK_EVENTS_ENDPOINT,
  PAGE_LOAD_EVENTS_ENDPOINT,
  HTTP_CALLS_ENDPOINT,
  SESSIONS_ENDPOINT,
} from './config';
import { formatDateTime } from './date';

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
  const payload: ClickEvent = { ...event, dateTime: formatDateTime(new Date()) };
  return postEvent(CLICK_EVENTS_ENDPOINT, payload);
};

export const trackPageLoad = (event: PageLoadEventInput): Promise<AnalyticsResponse> => {
  const payload: PageLoadEvent = { ...event, dateTime: formatDateTime(new Date()) };
  return postEvent(PAGE_LOAD_EVENTS_ENDPOINT, payload);
};

export const trackHttpCall = (event: HttpCallEventInput): Promise<AnalyticsResponse> => {
  const payload: HttpCallEvent = { ...event, dateTime: formatDateTime(new Date()) };
  return postEvent(HTTP_CALLS_ENDPOINT, payload);
};

export const trackSession = (session: SessionInput): Promise<AnalyticsResponse> => {
  const payload: Session = { ...session, startedAt: formatDateTime(new Date()) };
  return postEvent(SESSIONS_ENDPOINT, payload);
};
