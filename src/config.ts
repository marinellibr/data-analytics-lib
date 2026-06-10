const isDevelopment = process.env.NODE_ENV === 'development';

const DEV_API_URL = 'http://localhost:3000';
const PROD_API_URL = process.env.API_URL_PROD || '';

export const getApiUrl = (): string => {
  const baseUrl = isDevelopment ? DEV_API_URL : PROD_API_URL;

  if (!baseUrl) {
    throw new Error('API_URL_PROD environment variable is not set in production');
  }

  return baseUrl;
};

export const EVENTS_ENDPOINT = '/events';
export const HTTP_CALLS_ENDPOINT = '/http-calls';
export const SESSIONS_ENDPOINT = '/sessions';
