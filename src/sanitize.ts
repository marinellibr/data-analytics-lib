export const MAX_FIELD_LENGTH = 500;

// Query strings and fragments often carry sensitive data (emails, tokens,
// search terms), so they are stripped before anything leaves the browser
export const stripQueryAndFragment = (value: string): string => {
  const queryIndex = value.indexOf('?');
  const fragmentIndex = value.indexOf('#');

  const cutAt = Math.min(
    queryIndex === -1 ? value.length : queryIndex,
    fragmentIndex === -1 ? value.length : fragmentIndex
  );

  return value.slice(0, cutAt);
};

export const truncate = (value: string): string => value.slice(0, MAX_FIELD_LENGTH);

// For page paths, endpoints and referrers: strip sensitive parts, then cap length
export const sanitizeUrl = (value: string): string => truncate(stripQueryAndFragment(value));
