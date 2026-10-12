import type { TransactionStatisticsDto } from '@/entities/transaction';

import { computeTransactionStats, initialOf } from './profile-view';

function createStatistics(transactionCount: number, firstTransactionDate: string | null): TransactionStatisticsDto {
  return { transactionCount, firstTransactionDate, tagUsages: [] };
}

describe('computeTransactionStats', () => {
  test('reports the transaction count and the first transaction month as "since"', () => {
    const stats = computeTransactionStats(createStatistics(3, '2026-01-10'));

    expect(stats.count).toBe(3);
    expect(stats.sinceLabel).toBe('jan 2026');
  });

  test('returns a placeholder when there are no transactions', () => {
    const stats = computeTransactionStats(createStatistics(0, null));

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
