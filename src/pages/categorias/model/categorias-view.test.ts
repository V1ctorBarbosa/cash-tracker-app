import type { TagDto } from '@/entities/tag';
import type { TransactionDto } from '@/entities/transaction';

import { buildTagRows } from './categorias-view';

// entities/transaction's barrel pulls in TanStack Query hooks that import http-client.ts ->
// firebase.ts -> AsyncStorage's native module, which Jest can't resolve -- mocked so this
// pure logic can be tested in isolation.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

function createTag(id: string, kind: TagDto['kind']): TagDto {
  return { id, name: `Tag ${id}`, color: '#3f4a35', kind };
}

function createTransaction(tagId: string): TransactionDto {
  return {
    id: `transaction-${tagId}-${Math.random()}`,
    type: 'Expense',
    amount: 10,
    date: '2026-01-10',
    description: 'Descrição',
    tagId,
    paymentMethod: 'Pix',
    recurringTransactionId: null,
    createdAt: '2026-01-10T12:00:00Z',
  };
}

describe('buildTagRows', () => {
  test('maps each tag to a row with its kind label and singular usage count', () => {
    const rows = buildTagRows([createTag('tag-1', 'Expense')], [createTransaction('tag-1')]);

    expect(rows).toEqual([{ id: 'tag-1', name: 'Tag tag-1', color: '#3f4a35', kindLabel: 'despesa', usesLabel: '1 lançamento' }]);
  });

  test('pluralizes the usage count and labels income tags as receita', () => {
    const rows = buildTagRows([createTag('tag-2', 'Income')], [createTransaction('tag-2'), createTransaction('tag-2')]);

    expect(rows[0].kindLabel).toBe('receita');
    expect(rows[0].usesLabel).toBe('2 lançamentos');
  });

  test('reports zero usage for a tag with no transactions', () => {
    const rows = buildTagRows([createTag('tag-3', 'Expense')], []);

    expect(rows[0].usesLabel).toBe('0 lançamentos');
  });
});
