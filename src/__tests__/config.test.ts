import {
  CLICK_EVENTS_ENDPOINT,
  PAGE_LOAD_EVENTS_ENDPOINT,
  HTTP_CALLS_ENDPOINT,
  SESSIONS_ENDPOINT,
} from '../config';

describe('config', () => {
  describe('getApiUrl', () => {
    it('should return dev URL when NODE_ENV is development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      jest.resetModules();
      const { getApiUrl } = require('../config');
      const url = getApiUrl();
      
      expect(url).toBe('http://localhost:3000');
      process.env.NODE_ENV = originalEnv;
    });

    it('should return prod URL from environment variable when NODE_ENV is production', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalApiUrl = process.env.API_URL_PROD;
      
      process.env.NODE_ENV = 'production';
      process.env.API_URL_PROD = 'https://api.example.com';
      
      jest.resetModules();
      const { getApiUrl } = require('../config');
      const url = getApiUrl();
      
      expect(url).toBe('https://api.example.com');
      
      process.env.NODE_ENV = originalEnv;
      process.env.API_URL_PROD = originalApiUrl;
    });

    it('should throw error if API_URL_PROD is not set in production', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalApiUrl = process.env.API_URL_PROD;
      
      process.env.NODE_ENV = 'production';
      delete process.env.API_URL_PROD;
      
      jest.resetModules();
      const { getApiUrl } = require('../config');

      expect(() => getApiUrl()).toThrow(
        'API_URL_PROD environment variable is not set in production'
      );
      
      process.env.NODE_ENV = originalEnv;
      if (originalApiUrl) process.env.API_URL_PROD = originalApiUrl;
    });
  });

  describe('endpoints', () => {
    it('should export correct endpoints', () => {
      expect(CLICK_EVENTS_ENDPOINT).toBe('/click-events');
      expect(PAGE_LOAD_EVENTS_ENDPOINT).toBe('/page-load-events');
      expect(HTTP_CALLS_ENDPOINT).toBe('/http-calls');
      expect(SESSIONS_ENDPOINT).toBe('/sessions');
    });
  });
});
