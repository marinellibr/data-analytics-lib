import { sanitizeUrl, stripQueryAndFragment, truncate, MAX_FIELD_LENGTH } from '../sanitize';

describe('stripQueryAndFragment', () => {
  it('should remove query strings', () => {
    expect(stripQueryAndFragment('/reset-password?token=abc123')).toBe('/reset-password');
    expect(stripQueryAndFragment('/search?q=email@example.com')).toBe('/search');
  });

  it('should remove fragments', () => {
    expect(stripQueryAndFragment('/page#section')).toBe('/page');
  });

  it('should remove both query and fragment regardless of order', () => {
    expect(stripQueryAndFragment('/page?a=1#top')).toBe('/page');
    expect(stripQueryAndFragment('/page#top?a=1')).toBe('/page');
  });

  it('should leave clean paths untouched', () => {
    expect(stripQueryAndFragment('/crm/contacts')).toBe('/crm/contacts');
    expect(stripQueryAndFragment('google.com')).toBe('google.com');
    expect(stripQueryAndFragment('direct')).toBe('direct');
  });
});

describe('truncate', () => {
  it('should cap strings at MAX_FIELD_LENGTH', () => {
    const long = 'a'.repeat(MAX_FIELD_LENGTH + 100);
    expect(truncate(long)).toHaveLength(MAX_FIELD_LENGTH);
  });

  it('should leave short strings untouched', () => {
    expect(truncate('#btn-save')).toBe('#btn-save');
  });
});

describe('sanitizeUrl', () => {
  it('should strip sensitive parts and cap length', () => {
    const long = '/path/' + 'a'.repeat(600) + '?token=secret';
    const result = sanitizeUrl(long);
    expect(result).not.toContain('token');
    expect(result.length).toBeLessThanOrEqual(MAX_FIELD_LENGTH);
  });
});
