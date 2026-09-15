import type { TagDto } from '@/entities/tag';
import type { TransactionDto } from '@/entities/transaction';

import { buildDeleteSummary } from './delete-transaction-view';

// getPaymentMethodLabel (used by buildDeleteSummary) lives in a module that also exports TanStack
// Query hooks importing the Firebase client -- mocked so this pure logic can be tested without
// pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

const BaseTransaction: TransactionDto = {
  id: 'transaction-1',
  type: 'Expense',
  amount: 89.9,
  date: '2026-09-10',
  description: 'Supermercado',
  tagId: 'tag-mercado',
  paymentMethod: 'CartaoDebito',
  recurringTransactionId: null,
  createdAt: '2026-09-10T18:32:00Z',
};

const Tags: TagDto[] = [{ id: 'tag-mercado', name: 'Mercado', color: '#000000', kind: 'Expense' }];

describe('buildDeleteSummary', () => {
  test('formats an expense with a minus sign, "despesa", and a tag/method/date meta line', () => {
    const summary = buildDeleteSummary(BaseTransaction, Tags);

    expect(summary).toEqual({
      headline: 'Supermercado',
      typeLabel: 'despesa',
      signedAmount: '− 89,90',
      metaLine: 'Mercado · Cartão Débito · 10/09/2026',
    });
  });

  test('formats income with a plus sign and "receita"', () => {
    const summary = buildDeleteSummary({ ...BaseTransaction, type: 'Income', amount: 5200 }, Tags);

    expect(summary.signedAmount).toBe('+ 5.200,00');
    expect(summary.typeLabel).toBe('receita');
  });

  test('falls back to the tag name for the headline when there is no description', () => {
    const summary = buildDeleteSummary({ ...BaseTransaction, description: null }, Tags);

    expect(summary.headline).toBe('Mercado');
  });

  test('falls back to the raw tag id in the meta line when the tag no longer exists', () => {
    const summary = buildDeleteSummary({ ...BaseTransaction, tagId: 'tag-deleted' }, Tags);

    expect(summary.metaLine).toBe('tag-deleted · Cartão Débito · 10/09/2026');
  });
});
