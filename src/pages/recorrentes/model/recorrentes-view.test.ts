import type { RecurringTransactionDto } from '@/entities/recurring-transaction';
import type { TagDto } from '@/entities/tag';
import { Colors } from '@/constants/theme';

import { buildRecurringRows, countActiveRecurring } from './recorrentes-view';

// entities/transaction's barrel pulls in TanStack Query hooks that import http-client.ts ->
// firebase.ts -> AsyncStorage's native module, which Jest can't resolve -- mocked so this
// pure logic can be tested in isolation.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

const Tags: TagDto[] = [{ id: 'tag-moradia', name: 'Moradia', color: '#8aa07f', kind: 'Expense' }];

function createRecurring(overrides: Partial<RecurringTransactionDto>): RecurringTransactionDto {
  return {
    id: 'recurring-1',
    type: 'Expense',
    amount: 1800,
    description: 'Aluguel',
    tagId: 'tag-moradia',
    paymentMethod: 'TransferenciaBancaria',
    dayOfMonth: 5,
    startDate: '2026-01-01',
    endDate: null,
    active: true,
    ...overrides,
  };
}

describe('buildRecurringRows', () => {
  test('formats an active expense as a negative amount with the accent state badge', () => {
    const [row] = buildRecurringRows([createRecurring({})], Tags);

    expect(row.name).toBe('Aluguel');
    expect(row.amount).toBe('− 1.800,00');
    expect(row.tag).toBe('Moradia');
    expect(row.state).toBe('ativa');
    expect(row.stateBg).toBe(Colors.light.accent);
    expect(row.stateFg).toBe(Colors.light.card);
    expect(row.opacity).toBe(1);
  });

  test('formats an income recurring definition as a positive amount', () => {
    const [row] = buildRecurringRows([createRecurring({ type: 'Income', amount: 5200, description: 'Salário' })], Tags);

    expect(row.amount).toBe('+ 5.200,00');
  });

  test('dims and mutes a paused recurring definition', () => {
    const [row] = buildRecurringRows([createRecurring({ active: false })], Tags);

    expect(row.state).toBe('pausada');
    expect(row.stateBg).toBe('transparent');
    expect(row.stateFg).toBe(Colors.light.muted);
    expect(row.opacity).toBeLessThan(1);
  });

  test('shows "desde" the start month when there is no end date', () => {
    const [row] = buildRecurringRows([createRecurring({ startDate: '2026-01-15', endDate: null })], Tags);

    expect(row.meta).toBe('todo dia 5 · desde jan 2026');
  });

  test('shows "encerra" the end month when the definition has one', () => {
    const [row] = buildRecurringRows([createRecurring({ endDate: '2026-12-01' })], Tags);

    expect(row.meta).toBe('todo dia 5 · encerra dez 2026');
  });

  test('falls back to the raw tag id when the tag no longer exists', () => {
    const [row] = buildRecurringRows([createRecurring({ tagId: 'tag-deleted' })], Tags);

    expect(row.tag).toBe('tag-deleted');
  });
});

describe('countActiveRecurring', () => {
  test('counts only the active recurring definitions', () => {
    const count = countActiveRecurring([createRecurring({ active: true }), createRecurring({ active: false }), createRecurring({ active: true })]);

    expect(count).toBe(2);
  });

  test('returns zero for an empty list', () => {
    expect(countActiveRecurring([])).toBe(0);
  });
});
