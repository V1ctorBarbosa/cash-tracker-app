import type { RecurringTransactionDto } from '@/entities/recurring-transaction';
import type { TagDto } from '@/entities/tag';
import { TransactionType } from '@/entities/transaction';
import { Colors } from '@/constants/theme';
import { formatMonthShort } from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/format';

const PausedRowOpacity = 0.55;

export type RecurringRow = {
  id: string;
  name: string;
  meta: string;
  amount: string;
  tag: string;
  state: string;
  stateBg: string;
  stateFg: string;
  opacity: number;
};

export function buildRecurringRows(recurringTransactions: RecurringTransactionDto[], tags: TagDto[]): RecurringRow[] {
  return recurringTransactions.map((recurring) => buildRecurringRow(recurring, tags));
}

export function countActiveRecurring(recurringTransactions: RecurringTransactionDto[]): number {
  return recurringTransactions.filter((recurring) => recurring.active).length;
}

export function buildActiveRecurringLabel(recurringTransactions: RecurringTransactionDto[]): string {
  const activeCount = countActiveRecurring(recurringTransactions);
  return activeCount === 1 ? '1 ativa' : `${activeCount} ativas`;
}

function buildRecurringRow(recurring: RecurringTransactionDto, tags: TagDto[]): RecurringRow {
  const isIncome = recurring.type === TransactionType.Income;
  const tagName = tags.find((tag) => tag.id === recurring.tagId)?.name ?? recurring.tagId;

  return {
    id: recurring.id,
    name: recurring.description,
    meta: buildRecurringMeta(recurring),
    amount: `${isIncome ? '+' : '−'} ${formatAmount(recurring.amount)}`,
    tag: tagName,
    state: recurring.active ? 'ativa' : 'pausada',
    stateBg: recurring.active ? Colors.light.accent : 'transparent',
    stateFg: recurring.active ? Colors.light.card : Colors.light.muted,
    opacity: recurring.active ? 1 : PausedRowOpacity,
  };
}

function buildRecurringMeta(recurring: RecurringTransactionDto): string {
  const dayLabel = `todo dia ${recurring.dayOfMonth}`;

  if (recurring.endDate !== null) {
    const [endYear, endMonth] = recurring.endDate.split('-').map(Number);
    return `${dayLabel} · encerra ${formatMonthShort(endYear, endMonth)}`;
  }

  const [startYear, startMonth] = recurring.startDate.split('-').map(Number);
  return `${dayLabel} · desde ${formatMonthShort(startYear, startMonth)}`;
}
