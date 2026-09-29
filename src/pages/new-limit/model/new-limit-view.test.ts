import type { TagAmountDto } from '@/entities/dashboard';
import type { TagDto } from '@/entities/tag';

import { buildExpenseTags, buildMonthOptions, computeAveragePct, computeTrailingMonthlyAverage } from './new-limit-view';

// entities/transaction's barrel pulls in TanStack Query hooks that import http-client.ts ->
// firebase.ts -> AsyncStorage's native module, which Jest can't resolve -- mocked so this
// pure logic can be tested in isolation.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

describe('buildMonthOptions', () => {
  test('returns the previous, current, and next month in order', () => {
    const options = buildMonthOptions(2026, 9);

    expect(options.map((option) => option.label)).toEqual(['ago 2026', 'set 2026', 'out 2026']);
  });

  test('rolls across a year boundary', () => {
    const options = buildMonthOptions(2026, 1);

    expect(options.map((option) => `${option.year}-${option.month}`)).toEqual(['2025-12', '2026-1', '2026-2']);
  });
});

describe('buildExpenseTags', () => {
  test('keeps only expense-kind tags, savings included', () => {
    const tags: TagDto[] = [
      { id: 'tag-mercado', name: 'Mercado', color: '#000', kind: 'Expense', isSystemDefined: false },
      { id: 'tag-salario', name: 'Salário', color: '#000', kind: 'Income', isSystemDefined: false },
      { id: 'tag-poupanca', name: 'Poupança', color: '#000', kind: 'Expense', isSystemDefined: false },
    ];

    const expenseTags = buildExpenseTags(tags);

    expect(expenseTags.map((tag) => tag.name)).toEqual(['Mercado', 'Poupança']);
  });
});

describe('computeTrailingMonthlyAverage', () => {
  test('divides the summed trailing amount by the number of months', () => {
    const spendByTag: TagAmountDto[] = [{ tagId: 'tag-mercado', tagName: 'Mercado', tagColor: '#3f4a35', amount: 649.2 }];

    expect(computeTrailingMonthlyAverage(spendByTag, 'tag-mercado')).toBeCloseTo(216.4);
  });

  test('returns zero when the tag has no spend in the window', () => {
    expect(computeTrailingMonthlyAverage([], 'tag-mercado')).toBe(0);
  });
});

describe('computeAveragePct', () => {
  test('computes the average as a percentage of the entered limit', () => {
    expect(computeAveragePct(216.4, 300)).toBe(72);
  });

  test('caps at 100 when the average exceeds the limit', () => {
    expect(computeAveragePct(400, 300)).toBe(100);
  });

  test('returns zero when the limit is not yet a positive number', () => {
    expect(computeAveragePct(216.4, 0)).toBe(0);
  });
});
