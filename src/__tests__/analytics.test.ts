import { trackEvent } from '../analytics';
import * as config from '../config';

jest.mock('../config');

describe('trackEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('successful request', () => {
    it('should add dateTime to entry and send POST request with correct structure', async () => {
      const mockResponse = { success: true, id: '123' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResponse);
      expect(response.error).toBeUndefined();
    });

    it('should call fetch with correct URL and headers', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'app1',
        action: 'action1',
        where: '/page1',
      };

      await trackEvent(entry);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/new-entry',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should include all entry fields plus dateTime in request body', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'my-app',
        action: 'click',
        where: '/dashboard',
      };

      const beforeTime = new Date();
      await trackEvent(entry);
      const afterTime = new Date();

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.appID).toBe('my-app');
      expect(body.action).toBe('click');
      expect(body.where).toBe('/dashboard');
      expect(body.dateTime).toBeDefined();

      const parsedDateTime = new Date(body.dateTime);
      expect(parsedDateTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(parsedDateTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('HTTP error responses', () => {
    it('should return error object on 400 HTTP response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('HTTP_400');
      expect(response.error?.message).toBe('Bad request');
      expect(response.error?.details).toEqual({ message: 'Bad request' });
      expect(response.data).toBeUndefined();
    });

    it('should return error object on 500 HTTP response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('HTTP_500');
      expect(response.error?.message).toBe('Internal server error');
    });

    it('should use default message when response lacks message property', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({}),
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('HTTP_403');
      expect(response.error?.message).toBe('HTTP Error: 403');
    });
  });

  describe('network and fetch errors', () => {
    it('should handle fetch network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NETWORK_ERROR');
      expect(response.error?.message).toBe('Network timeout');
      expect(response.data).toBeUndefined();
    });

    it('should handle non-Error exception from fetch', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('Unknown error');

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NETWORK_ERROR');
      expect(response.error?.message).toBe('Unknown error occurred');
    });

    it('should handle JSON parsing error in successful response', async () => {
      const error = new SyntaxError('Invalid JSON');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw error;
        },
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NETWORK_ERROR');
      expect(response.error?.message).toBe('Invalid JSON');
    });
  });

  describe('edge cases', () => {
    it('should work with empty string values', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: '',
        action: '',
        where: '',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(true);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.appID).toBe('');
      expect(body.action).toBe('');
      expect(body.where).toBe('');
    });

    it('should work with special characters in values', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'app-@#$%',
        action: 'action_with_unicode_✓',
        where: '/path/with spaces',
      };

      const response = await trackEvent(entry);

      expect(response.success).toBe(true);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.appID).toBe('app-@#$%');
      expect(body.action).toBe('action_with_unicode_✓');
      expect(body.where).toBe('/path/with spaces');
    });

    it('should preserve original entry object (not mutate)', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');

      const entry = {
        appID: 'test-app',
        action: 'test_action',
        where: '/test',
      };

      const entryBefore = JSON.stringify(entry);
      await trackEvent(entry);
      const entryAfter = JSON.stringify(entry);

      expect(entryBefore).toBe(entryAfter);
      expect((entry as any).dateTime).toBeUndefined();
    });
  });
});
