import { trackClick, trackPageLoad, trackHttpCall, trackSession } from '../analytics';
import * as config from '../config';

jest.mock('../config');
jest.mock('../bot');

const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const mockFetchSuccess = (response: unknown = { success: true }) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => response,
  });
};

const lastRequestBody = () => {
  const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
  return JSON.parse(callArgs.body);
};

describe('track functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (config.getApiUrl as jest.Mock).mockReturnValue('http://localhost:3000');
  });

  describe('trackClick', () => {
    it('should POST to /events with all fields plus ISO timestamp', async () => {
      mockFetchSuccess({ success: true, id: '123' });

      const response = await trackClick({
        appID: 'crm',
        sessionID: 's001',
        location: '/crm/contacts',
        element: '#btn-new-contact',
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ success: true, id: '123' });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/events',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const body = lastRequestBody();
      expect(body.type).toBe('click');
      expect(body.appID).toBe('crm');
      expect(body.sessionID).toBe('s001');
      expect(body.location).toBe('/crm/contacts');
      expect(body.element).toBe('#btn-new-contact');
      expect(body.timestamp).toMatch(ISO_TIMESTAMP_REGEX);
    });

    it('should accept click without element field', async () => {
      mockFetchSuccess();

      const response = await trackClick({
        appID: 'crm',
        sessionID: 's001',
        location: '/crm/contacts',
      });

      expect(response.success).toBe(true);
      const body = lastRequestBody();
      expect(body.element).toBeUndefined();
    });

    it('should preserve original event object (not mutate)', async () => {
      mockFetchSuccess();

      const event = {
        appID: 'crm',
        sessionID: 's001',
        location: '/crm/contacts',
        element: '#btn-new-contact',
      };

      const eventBefore = JSON.stringify(event);
      await trackClick(event);

      expect(JSON.stringify(event)).toBe(eventBefore);
      expect((event as any).timestamp).toBeUndefined();
      expect((event as any).type).toBeUndefined();
    });
  });

  describe('trackPageLoad', () => {
    it('should POST to /events with all fields plus ISO timestamp', async () => {
      mockFetchSuccess();

      const response = await trackPageLoad({
        appID: 'hr',
        sessionID: 's009',
        location: '/hr/employees',
        timeOnPage: 45200,
      });

      expect(response.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/events',
        expect.objectContaining({ method: 'POST' })
      );

      const body = lastRequestBody();
      expect(body.type).toBe('pageview');
      expect(body.appID).toBe('hr');
      expect(body.sessionID).toBe('s009');
      expect(body.location).toBe('/hr/employees');
      expect(body.timeOnPage).toBe(45200);
      expect(body.timestamp).toMatch(ISO_TIMESTAMP_REGEX);
    });
  });

  describe('trackHttpCall', () => {
    it('should POST to /http-calls with all fields plus ISO timestamp', async () => {
      mockFetchSuccess();

      const response = await trackHttpCall({
        appID: 'crm',
        sessionID: 's002',
        endpoint: '/api/crm/deals',
        method: 'GET',
        status: 200,
        duration: 232,
      });

      expect(response.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/http-calls',
        expect.objectContaining({ method: 'POST' })
      );

      const body = lastRequestBody();
      expect(body.appID).toBe('crm');
      expect(body.sessionID).toBe('s002');
      expect(body.endpoint).toBe('/api/crm/deals');
      expect(body.method).toBe('GET');
      expect(body.status).toBe(200);
      expect(body.duration).toBe(232);
      expect(body.timestamp).toMatch(ISO_TIMESTAMP_REGEX);
    });
  });

  describe('trackSession', () => {
    it('should POST to /sessions with all fields plus ISO startTime', async () => {
      mockFetchSuccess();

      const response = await trackSession({
        sessionID: 's001',
        appID: 'crm',
        context: {
          device: 'desktop',
          browser: 'Chrome 124',
          referrer: 'google.com',
        },
      });

      expect(response.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/sessions',
        expect.objectContaining({ method: 'POST' })
      );

      const body = lastRequestBody();
      expect(body.sessionID).toBe('s001');
      expect(body.appID).toBe('crm');
      expect(body.context.device).toBe('desktop');
      expect(body.context.browser).toBe('Chrome 124');
      expect(body.context.referrer).toBe('google.com');
      expect(body.startTime).toMatch(ISO_TIMESTAMP_REGEX);
    });

    it('should include optional session fields when provided', async () => {
      mockFetchSuccess();

      const response = await trackSession({
        sessionID: 's002',
        appID: 'hr',
        userID: 'user-123',
        context: {
          device: 'mobile',
          browser: 'Safari',
          referrer: 'direct',
          utmSource: 'google',
        },
      });

      expect(response.success).toBe(true);
      const body = lastRequestBody();
      expect(body.userID).toBe('user-123');
      expect(body.context.utmSource).toBe('google');
    });
  });

  describe('HTTP error responses', () => {
    const clickEvent = {
      appID: 'crm',
      sessionID: 's001',
      location: '/crm/contacts',
      element: '#btn',
    };

    it('should return error object on 400 HTTP response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      });

      const response = await trackClick(clickEvent);

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

      const response = await trackClick(clickEvent);

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

      const response = await trackClick(clickEvent);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('HTTP_403');
      expect(response.error?.message).toBe('HTTP Error: 403');
    });
  });

  describe('network and fetch errors', () => {
    const sessionInput = {
      sessionID: 's001',
      appID: 'crm',
      context: {
        device: 'desktop' as const,
        browser: 'Chrome 124',
        referrer: 'direct',
      },
    };

    it('should handle fetch network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      const response = await trackSession(sessionInput);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NETWORK_ERROR');
      expect(response.error?.message).toBe('Network timeout');
      expect(response.data).toBeUndefined();
    });

    it('should handle non-Error exception from fetch', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('Unknown error');

      const response = await trackSession(sessionInput);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NETWORK_ERROR');
      expect(response.error?.message).toBe('Unknown error occurred');
    });

    it('should handle JSON parsing error in successful response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Invalid JSON');
        },
      });

      const response = await trackSession(sessionInput);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NETWORK_ERROR');
      expect(response.error?.message).toBe('Invalid JSON');
    });
  });
});
