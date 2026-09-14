import { formatAmount, formatCurrency } from './format';

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
