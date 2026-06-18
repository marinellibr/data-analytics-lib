// Reads an env var when running under Node/bundlers that define `process`.
// Guarded so the library is safe to load in the browser, where `process`
// is not defined (e.g. Angular/React app bundles).
const getEnv = (key: string): string | undefined =>
  typeof process !== 'undefined' && process.env ? process.env[key] : undefined;

const isDevelopment = getEnv('NODE_ENV') === 'development';

const DEV_API_URL = 'http://localhost:3000';
const PROD_API_URL = getEnv('API_URL_PROD') || 'https://data-analytics-backend-two.vercel.app';

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
