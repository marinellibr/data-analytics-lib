import { formatDateTime } from '../date';

describe('formatDateTime', () => {
  it('should format a morning date as dd/MM/yyyy hh:mm AM', () => {
    const date = new Date(2026, 5, 5, 8, 30); // 05/06/2026 08:30
    expect(formatDateTime(date)).toBe('05/06/2026 08:30 AM');
  });

  it('should format an afternoon date as dd/MM/yyyy hh:mm PM', () => {
    const date = new Date(2026, 5, 6, 14, 34); // 06/06/2026 02:34 PM
    expect(formatDateTime(date)).toBe('06/06/2026 02:34 PM');
  });

  it('should format midnight as 12:00 AM', () => {
    const date = new Date(2026, 0, 1, 0, 0);
    expect(formatDateTime(date)).toBe('01/01/2026 12:00 AM');
  });

  it('should format noon as 12:00 PM', () => {
    const date = new Date(2026, 11, 31, 12, 0);
    expect(formatDateTime(date)).toBe('31/12/2026 12:00 PM');
  });
});
