import { trackEvent } from '../analytics';
import * as config from '../config';

jest.mock('../config');

describe('trackEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should add dateTime to entry and send POST request', async () => {
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
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/new-entry',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body.appID).toBe('test-app');
    expect(body.action).toBe('test_action');
    expect(body.where).toBe('/test');
    expect(body.dateTime).toBeDefined();
  });

  it('should return error on HTTP error response', async () => {
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
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
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
    expect(response.error?.message).toBe('Network error');
  });
});
