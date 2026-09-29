import { formatDateTimeBR } from '@/shared/lib/date';

import { buildDetailRows, buildHeadline, typeLabel } from './transaction-detail-view';

// getPaymentMethodLabel (used by buildDetailRows) lives in a module that also exports TanStack
// Query hooks importing the Firebase client -- mocked so this pure logic can be tested without
// pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

const BaseTransaction = {
  id: '019f4a2c-abcd-1234-ef00-000000000000',
  type: 'Expense' as const,
  amount: 89.9,
  date: '2026-09-10',
  description: 'Supermercado',
  tagId: 'tag-mercado',
  paymentMethod: 'CartaoDebito' as const,
  recurringTransactionId: null,
  createdAt: '2026-09-10T18:32:00Z',
};

const Tags = [{ id: 'tag-mercado', name: 'Mercado', color: '#000000', kind: 'Expense' as const, isSystemDefined: false }];

describe('buildDetailRows', () => {
  test('resolves the tag name, formats the payment method, date, and timestamp, and shortens the id', () => {
    const rows = buildDetailRows(BaseTransaction, Tags);

    expect(rows).toEqual([
      { label: 'categoria', value: 'Mercado' },
      { label: 'forma de pagamento', value: 'Cartão Débito' },
      { label: 'data', value: '10/09/2026' },
      { label: 'recorrência', value: 'lançamento único' },
      { label: 'registrado em', value: formatDateTimeBR(BaseTransaction.createdAt) },
      { label: 'id', value: '019f4a2c' },
    ]);
  });

  test('labels a transaction linked to a recurring definition', () => {
    const rows = buildDetailRows({ ...BaseTransaction, recurringTransactionId: 'recurring-1' }, Tags);

    expect(rows.find((row) => row.label === 'recorrência')?.value).toBe('transação recorrente');
  });

  test('falls back to the raw tag id when the tag no longer exists', () => {
    const rows = buildDetailRows({ ...BaseTransaction, tagId: 'tag-deleted' }, Tags);

    expect(rows.find((row) => row.label === 'categoria')?.value).toBe('tag-deleted');
  });
});

describe('buildHeadline', () => {
  test('uses the description when the transaction has one', () => {
    expect(buildHeadline(BaseTransaction, Tags)).toBe('Supermercado');
  });

  test('falls back to the tag name when there is no description', () => {
    expect(buildHeadline({ ...BaseTransaction, description: null }, Tags)).toBe('Mercado');
  });

  test('falls back to the raw tag id when there is no description and the tag no longer exists', () => {
    expect(buildHeadline({ ...BaseTransaction, description: null, tagId: 'tag-deleted' }, Tags)).toBe('tag-deleted');
  });
});

describe('typeLabel', () => {
  test('translates Income to "receita"', () => {
    expect(typeLabel('Income')).toBe('receita');
  });

  test('translates Expense to "despesa"', () => {
    expect(typeLabel('Expense')).toBe('despesa');
  });
});
