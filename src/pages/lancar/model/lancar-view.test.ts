import { parseDateInput, todayAsBRDate } from './lancar-view';

describe('parseDateInput', () => {
  test('parses a DD/MM/AAAA date into ISO format', () => {
    expect(parseDateInput('10/09/2026')).toBe('2026-09-10');
  });

  test.each(['2026-09-10', '10-09-2026', '32/01/2026', '29/02/2026', 'not a date'])(
    'returns null for an invalid or malformed input %p',
    (input) => {
      expect(parseDateInput(input)).toBeNull();
    },
  );

  test('accepts February 29 in a leap year', () => {
    expect(parseDateInput('29/02/2028')).toBe('2028-02-29');
  });
});

describe('todayAsBRDate', () => {
  test('formats as DD/MM/AAAA', () => {
    expect(todayAsBRDate()).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});
