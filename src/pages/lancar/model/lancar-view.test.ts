import { parseAmountInput, parseDateInput, todayAsBRDate } from './lancar-view';

describe('parseAmountInput', () => {
  test('parses a pt-BR formatted amount with thousands separator', () => {
    expect(parseAmountInput('1.234,56')).toBe(1234.56);
  });

  test('parses a simple decimal amount', () => {
    expect(parseAmountInput('89,90')).toBe(89.9);
  });

  test.each(['', '0', '-5', 'abc', ','])('returns null for an invalid or non-positive input %p', (input) => {
    expect(parseAmountInput(input)).toBeNull();
  });
});

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
