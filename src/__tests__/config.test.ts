import { getApiUrl, ANALYTICS_ENDPOINT } from '../config';

describe('config', () => {
  const originalEnv = process.env;

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  it('should return dev URL when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    const { getApiUrl } = require('../config');

    const url = getApiUrl();
    expect(url).toBe('http://localhost:3000');
  });

  it('should return prod URL from environment variable', () => {
    process.env.NODE_ENV = 'production';
    process.env.API_URL_PROD = 'https://api.example.com';
    jest.resetModules();
    const { getApiUrl } = require('../config');

    const url = getApiUrl();
    expect(url).toBe('https://api.example.com');
  });

  it('should throw error if API_URL_PROD is not set in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.API_URL_PROD;
    jest.resetModules();
    const { getApiUrl } = require('../config');

    expect(() => getApiUrl()).toThrow('API_URL_PROD environment variable is not set in production');
  });

  it('should export ANALYTICS_ENDPOINT', () => {
    expect(ANALYTICS_ENDPOINT).toBe('/new-entry');
  });
});
