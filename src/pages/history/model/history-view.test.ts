import type { TagDto } from '@/entities/tag';
import type { TransactionDto } from '@/entities/transaction';

import { buildHistorySummary, filterTransactions, HistoryFilter } from './history-view';

// getPaymentMethodLabel (used by buildHistorySummary) lives in a module that also exports TanStack
// Query hooks importing the Firebase client -- mocked so this pure logic can be tested without
// pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

const Tags: TagDto[] = [{ id: 'tag-mercado', name: 'Mercado', color: '#3f4a35', kind: 'Expense' }];

function createTransaction(overrides: Partial<TransactionDto>): TransactionDto {
  return {
    id: 'transaction-1',
    type: 'Expense',
    amount: 50,
    date: '2026-06-10',
    description: 'Supermercado',
    tagId: 'tag-mercado',
    paymentMethod: 'Pix',
    recurringTransactionId: null,
    createdAt: '2026-06-10T12:00:00Z',
    ...overrides,
  };
}

describe('filterTransactions', () => {
  test('matches the description case-insensitively when a search text is given', () => {
    const transactions = [createTransaction({ description: 'Supermercado' }), createTransaction({ description: 'Aluguel' })];

    const result = filterTransactions(transactions, Tags, 'super', HistoryFilter.All);

    expect(result).toEqual([transactions[0]]);
  });

  test('matches the tag name when a transaction has no description', () => {
    const transactions = [createTransaction({ description: null }), createTransaction({ description: 'Aluguel' })];

    const result = filterTransactions(transactions, Tags, 'mercado', HistoryFilter.All);

    expect(result).toEqual([transactions[0]]);
  });

  test('keeps only expenses when the Expenses filter is active', () => {
    const transactions = [createTransaction({ type: 'Expense' }), createTransaction({ type: 'Income' })];

    const result = filterTransactions(transactions, Tags, '', HistoryFilter.Expenses);

    expect(result).toEqual([transactions[0]]);
  });

  test('keeps only income when the Income filter is active', () => {
    const transactions = [createTransaction({ type: 'Expense' }), createTransaction({ type: 'Income' })];

    const result = filterTransactions(transactions, Tags, '', HistoryFilter.Income);

    expect(result).toEqual([transactions[1]]);
  });

  test('keeps only transactions linked to a recurring definition when the Recurring filter is active', () => {
    const transactions = [createTransaction({ recurringTransactionId: null }), createTransaction({ recurringTransactionId: 'recurring-1' })];

    const result = filterTransactions(transactions, Tags, '', HistoryFilter.Recurring);

    expect(result).toEqual([transactions[1]]);
  });

  test('returns every transaction for an empty search and the All filter', () => {
    const transactions = [createTransaction({}), createTransaction({ id: 'transaction-2' })];

    const result = filterTransactions(transactions, Tags, '   ', HistoryFilter.All);

    expect(result).toEqual(transactions);
  });
});

describe('buildHistorySummary', () => {
  test('sorts items newest day first', () => {
    const transactions = [createTransaction({ id: 'early', date: '2026-06-01' }), createTransaction({ id: 'late', date: '2026-06-20' })];

    const summary = buildHistorySummary(transactions, Tags);

    expect(summary.items.map((item) => item.id)).toEqual(['late', 'early']);
  });

  test('computes a positive balance as income minus expenses, formatted with a plus sign', () => {
    const transactions = [
      createTransaction({ id: 'income', type: 'Income', amount: 200 }),
      createTransaction({ id: 'expense', type: 'Expense', amount: 50 }),
    ];

    const summary = buildHistorySummary(transactions, Tags);

    expect(summary.total).toBe('saldo + 150,00');
  });

  test('formats a negative balance with a minus sign', () => {
    const transactions = [createTransaction({ id: 'expense', type: 'Expense', amount: 200 })];

    const summary = buildHistorySummary(transactions, Tags);

    expect(summary.total).toBe('saldo − 200,00');
  });

  test('resolves the tag name and falls back to the raw tag id when the tag no longer exists', () => {
    const transactions = [createTransaction({ tagId: 'tag-deleted' })];

    const summary = buildHistorySummary(transactions, Tags);

    expect(summary.items[0].metaLine).toBe('tag-deleted · Pix');
  });

  test('marks an item linked to a recurring definition', () => {
    const transactions = [createTransaction({ recurringTransactionId: 'recurring-1' })];

    const summary = buildHistorySummary(transactions, Tags);

    expect(summary.items[0].metaLine).toBe('Mercado · Pix recorrente');
  });

  test('omits the recurring marker for a one-off transaction', () => {
    const transactions = [createTransaction({ recurringTransactionId: null })];

    const summary = buildHistorySummary(transactions, Tags);

    expect(summary.items[0].metaLine).toBe('Mercado · Pix');
  });

  test('falls back to the tag name for the item description when there is none', () => {
    const transactions = [createTransaction({ description: null })];

    const summary = buildHistorySummary(transactions, Tags);

    expect(summary.items[0].desc).toBe('Mercado');
  });
});
