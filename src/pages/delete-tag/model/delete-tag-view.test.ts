import { TransactionType } from '@/entities/transaction';

import { tagKindLabel } from './delete-tag-view';

// TransactionType (used by tagKindLabel) lives in a module that also exports TanStack Query
// hooks importing the Firebase client -- mocked so this pure logic can be tested without
// pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

describe('tagKindLabel', () => {
  test('translates Income to "receita"', () => {
    expect(tagKindLabel(TransactionType.Income)).toBe('receita');
  });

  test('translates Expense to "despesa"', () => {
    expect(tagKindLabel(TransactionType.Expense)).toBe('despesa');
  });
});
