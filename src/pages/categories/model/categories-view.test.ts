import type { TagDto } from '@/entities/tag';

import { buildTagRows } from './categories-view';

// entities/transaction's barrel pulls in TanStack Query hooks that import http-client.ts ->
// firebase.ts -> AsyncStorage's native module, which Jest can't resolve -- mocked so this
// pure logic can be tested in isolation.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

function createTag(id: string, kind: TagDto['kind'], isSystemDefined = false): TagDto {
  return { id, name: `Tag ${id}`, color: '#3f4a35', kind, isSystemDefined };
}

describe('buildTagRows', () => {
  test('maps each tag to a row with its kind label and singular usage count', () => {
    const rows = buildTagRows([createTag('tag-1', 'Expense')], [{ tagId: 'tag-1', transactionCount: 1 }]);

    expect(rows).toEqual([
      { id: 'tag-1', name: 'Tag tag-1', color: '#3f4a35', kindLabel: 'despesa', usesLabel: '1 lançamento', isSystemDefined: false },
    ]);
  });

  test('carries whether the tag is the system-defined uncategorized tag', () => {
    const rows = buildTagRows([createTag('tag-1', 'Expense', true)], []);

    expect(rows[0].isSystemDefined).toBe(true);
  });

  test('pluralizes the usage count and labels income tags as receita', () => {
    const rows = buildTagRows([createTag('tag-2', 'Income')], [{ tagId: 'tag-2', transactionCount: 2 }]);

    expect(rows[0].kindLabel).toBe('receita');
    expect(rows[0].usesLabel).toBe('2 lançamentos');
  });

  test('reports zero usage for a tag with no usage entry', () => {
    const rows = buildTagRows([createTag('tag-3', 'Expense')], [{ tagId: 'tag-other', transactionCount: 5 }]);

    expect(rows[0].usesLabel).toBe('0 lançamentos');
  });
});
