import type { TransactionDto } from '@/entities/transaction';

import { computeTransactionStats, initialOf } from './perfil-view';

function createTransaction(date: string): TransactionDto {
  return {
    id: `transaction-${date}`,
    type: 'Expense',
    amount: 10,
    date,
    description: 'Descrição',
    tagId: 'tag-1',
    paymentMethod: 'Pix',
    recurringTransactionId: null,
    createdAt: `${date}T12:00:00Z`,
  };
}

describe('computeTransactionStats', () => {
  test('counts transactions and reports the earliest month as "since"', () => {
    const stats = computeTransactionStats([createTransaction('2026-06-15'), createTransaction('2026-01-10'), createTransaction('2026-03-01')]);

    expect(stats.count).toBe(3);
    expect(stats.sinceLabel).toBe('jan 2026');
  });

  test('returns a placeholder when there are no transactions', () => {
    const stats = computeTransactionStats([]);

    expect(stats.count).toBe(0);
    expect(stats.sinceLabel).toBe('—');
  });
});

describe('initialOf', () => {
  test('returns the uppercased first letter of a name', () => {
    expect(initialOf('Victor')).toBe('V');
  });

  test('trims leading whitespace before taking the first letter', () => {
    expect(initialOf('  victor')).toBe('V');
  });

  test('falls back to "?" for an empty name', () => {
    expect(initialOf('')).toBe('?');
  });
});
