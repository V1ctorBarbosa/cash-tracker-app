import {
  formatDateBR,
  formatDateTimeBR,
  formatMonthLong,
  formatMonthShort,
  getMonthDateRange,
  getTrailingMonthsRange,
  toIsoDate,
  toYearMonth,
} from './date';

describe('formatMonthLong', () => {
  test('formats month and year in Portuguese', () => {
    expect(formatMonthLong(2026, 9)).toBe('setembro 2026');
  });
});

describe('formatMonthShort', () => {
  test('formats an abbreviated month and year', () => {
    expect(formatMonthShort(2026, 9)).toBe('set 2026');
  });
});

describe('getMonthDateRange', () => {
  test('returns the first and last day of a 31-day month', () => {
    expect(getMonthDateRange(2026, 1)).toEqual({ from: '2026-01-01', to: '2026-01-31' });
  });

  test('returns the correct last day for February in a leap year', () => {
    expect(getMonthDateRange(2028, 2)).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });

  test('returns the correct last day for February in a non-leap year', () => {
    expect(getMonthDateRange(2026, 2)).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  });
});

describe('toIsoDate', () => {
  test('pads month and day to two digits', () => {
    expect(toIsoDate(2026, 9, 5)).toBe('2026-09-05');
  });
});

describe('toYearMonth', () => {
  test('pads the month to two digits', () => {
    expect(toYearMonth(2026, 9)).toBe('2026-09');
  });
});

describe('formatDateBR', () => {
  test('reorders an ISO date into DD/MM/AAAA', () => {
    expect(formatDateBR('2026-09-10')).toBe('10/09/2026');
  });
});

describe('formatDateTimeBR', () => {
  test('formats an ISO datetime as DD/MM/AAAA HH:mm', () => {
    const isoDateTime = '2026-09-10T18:32:00';
    expect(formatDateTimeBR(isoDateTime)).toBe('10/09/2026 18:32');
  });
});

describe('getTrailingMonthsRange', () => {
  test('spans the given number of months ending at (year, month), inclusive', () => {
    expect(getTrailingMonthsRange(2026, 9, 6)).toEqual({ from: '2026-04-01', to: '2026-09-30' });
  });

  test('rolls back across a year boundary', () => {
    expect(getTrailingMonthsRange(2026, 2, 6)).toEqual({ from: '2025-09-01', to: '2026-02-28' });
  });

  test('returns just the given month when monthsCount is 1', () => {
    expect(getTrailingMonthsRange(2026, 9, 1)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });
});
