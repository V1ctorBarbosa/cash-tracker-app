import { formatAmount, formatCurrency, maskCurrencyInput, parseAmountInput } from './format';

describe('formatAmount', () => {
  test('formats with pt-BR grouping and two decimal places', () => {
    expect(formatAmount(5200)).toBe('5.200,00');
  });

  test('rounds to two decimal places', () => {
    expect(formatAmount(89.9)).toBe('89,90');
  });

  test('formats zero', () => {
    expect(formatAmount(0)).toBe('0,00');
  });
});

describe('formatCurrency', () => {
  test('prefixes the amount with R$', () => {
    expect(formatCurrency(2929.2)).toBe('R$ 2.929,20');
  });
});

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

describe('maskCurrencyInput', () => {
  test('treats digits typed one at a time as cents, right-aligned', () => {
    expect(maskCurrencyInput('2')).toBe('0,02');
    expect(maskCurrencyInput('23')).toBe('0,23');
    expect(maskCurrencyInput('231')).toBe('2,31');
  });

  test('re-shifts correctly when a digit is deleted', () => {
    expect(maskCurrencyInput('2,3')).toBe('0,23');
  });

  test('ignores any non-digit characters already in the field', () => {
    expect(maskCurrencyInput('R$ 1.234,56')).toBe('1.234,56');
  });

  test('returns an empty string when there are no digits left', () => {
    expect(maskCurrencyInput('')).toBe('');
  });

  test('formats large amounts with thousands grouping', () => {
    expect(maskCurrencyInput('180000')).toBe('1.800,00');
  });
});
