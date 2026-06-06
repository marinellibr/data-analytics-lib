import { AnalyticsEntry, AnalyticsResponse, AnalyticsError } from './types';
import { getApiUrl, ANALYTICS_ENDPOINT } from './config';

export const trackEvent = async (entry: AnalyticsEntry): Promise<AnalyticsResponse> => {
  try {
    const entryWithDateTime = {
      ...entry,
      dateTime: new Date(),
    };

    const apiUrl = getApiUrl();
    const url = `${apiUrl}${ANALYTICS_ENDPOINT}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entryWithDateTime),
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
