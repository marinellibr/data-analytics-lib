import { isBot } from '../bot';

describe('isBot', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  const setNavigator = (value: unknown): void => {
    Object.defineProperty(globalThis, 'navigator', {
      value,
      configurable: true,
      writable: true,
    });
  };

  afterEach(() => {
    if (original) {
      Object.defineProperty(globalThis, 'navigator', original);
    } else {
      delete (globalThis as { navigator?: unknown }).navigator;
    }
  });

  it('returns false when navigator is undefined (non-browser env)', () => {
    setNavigator(undefined);
    expect(isBot()).toBe(false);
  });

  it('returns true when navigator.webdriver is true', () => {
    setNavigator({ webdriver: true, userAgent: 'Mozilla/5.0' });
    expect(isBot()).toBe(true);
  });

  it('returns true for a known bot user-agent', () => {
    setNavigator({
      webdriver: false,
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    });
    expect(isBot()).toBe(true);
  });

  it('returns false for a normal browser user-agent', () => {
    setNavigator({
      webdriver: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    expect(isBot()).toBe(false);
  });

  it('returns false when userAgent is missing', () => {
    setNavigator({ webdriver: false });
    expect(isBot()).toBe(false);
  });
});
