import type { TagDto } from '@/entities/tag';
import type { TransactionDto } from '@/entities/transaction';
import { formatDateRangeBR, formatMonthLong } from '@/shared/lib/date';

import {
  buildDeleteMonthButtonLabel,
  buildDeleteMonthPrompt,
  buildDeletedTransactionsToast,
  buildHistorySummary,
  canDeleteMonth,
  filterTransactions,
  HistoryFilter,
  resolveHistoryPeriod,
} from './history-view';

// getPaymentMethodLabel (used by buildHistorySummary) lives in a module that also exports TanStack
// Query hooks importing the Firebase client -- mocked so this pure logic can be tested without
// pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

const Tags: TagDto[] = [{ id: 'tag-mercado', name: 'Mercado', color: '#3f4a35', kind: 'Expense', isSystemDefined: false }];

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

  test('matches the description ignoring accents and case', () => {
    const transactions = [createTransaction({ description: 'Padaria São José' }), createTransaction({ description: 'Aluguel' })];

    const result = filterTransactions(transactions, Tags, 'PADARIA SAO JOSE', HistoryFilter.All);

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

describe('resolveHistoryPeriod', () => {
  test('uses the selected month, with its full date range, when there is no custom range', () => {
    const period = resolveHistoryPeriod(null, 2026, 9);

    expect(period.range).toEqual({ from: '2026-09-01', to: '2026-09-30' });
    expect(period.label).toBe(formatMonthLong(2026, 9));
  });

  test('uses the custom range, formatted as a date range, when one was picked', () => {
    const customRange = { from: '2026-09-10', to: '2026-10-05' };

    const period = resolveHistoryPeriod(customRange, 2026, 9);

    expect(period.range).toBe(customRange);
    expect(period.label).toBe(formatDateRangeBR(customRange));
  });
});

describe('canDeleteMonth', () => {
  test('is true for the selected month when it has transactions', () => {
    expect(canDeleteMonth(null, 3)).toBe(true);
  });

  test('is false when the month has no transactions', () => {
    expect(canDeleteMonth(null, 0)).toBe(false);
  });

  test('is false for a custom range, even when it has transactions', () => {
    expect(canDeleteMonth({ from: '2026-09-10', to: '2026-10-05' }, 3)).toBe(false);
  });
});

describe('buildDeleteMonthButtonLabel', () => {
  test('reads "apagar mês" while idle', () => {
    expect(buildDeleteMonthButtonLabel(false)).toBe('apagar mês');
  });

  test('reads "apagando…" while the delete is in flight', () => {
    expect(buildDeleteMonthButtonLabel(true)).toBe('apagando…');
  });
});

describe('buildDeleteMonthPrompt', () => {
  test('names the month in the title and asks to confirm with "Apagar"', () => {
    const prompt = buildDeleteMonthPrompt('setembro 2026', 12);

    expect(prompt.title).toBe('Apagar setembro 2026?');
    expect(prompt.confirmLabel).toBe('Apagar');
  });

  test('states the plural count, that it is permanent, and that recurring ones do not come back', () => {
    const prompt = buildDeleteMonthPrompt('setembro 2026', 12);

    expect(prompt.message).toContain('12 lançamentos de setembro 2026 serão apagados');
    expect(prompt.message).toContain('permanente');
    expect(prompt.message).toContain('recorrentes');
    expect(prompt.message).toContain('não pode ser desfeito');
  });

  test('uses the singular form for a single transaction', () => {
    const prompt = buildDeleteMonthPrompt('setembro 2026', 1);

    expect(prompt.message).toContain('1 lançamento de setembro 2026 será apagado');
  });
});

describe('buildDeletedTransactionsToast', () => {
  test.each([
    [0, 'Nenhum lançamento apagado'],
    [1, '1 lançamento apagado'],
    [2, '2 lançamentos apagados'],
    [37, '37 lançamentos apagados'],
  ])('for %i deleted transactions reads "%s"', (deletedCount, expected) => {
    expect(buildDeletedTransactionsToast(deletedCount)).toBe(expected);
  });
});
