const isDevelopment = process.env.NODE_ENV === 'development';

const DEV_API_URL = 'http://localhost:3000';
const PROD_API_URL = process.env.API_URL_PROD || 'https://data-analytics-backend-two.vercel.app';

export const getApiUrl = (): string => {
  const baseUrl = isDevelopment ? DEV_API_URL : PROD_API_URL;

  if (!baseUrl) {
    throw new Error('API_URL_PROD environment variable is not set in production');
  }

  return baseUrl;
};

export const CLICK_EVENTS_ENDPOINT = '/click-events';
export const PAGE_LOAD_EVENTS_ENDPOINT = '/page-load-events';
export const HTTP_CALLS_ENDPOINT = '/http-calls';
export const SESSIONS_ENDPOINT = '/sessions';
