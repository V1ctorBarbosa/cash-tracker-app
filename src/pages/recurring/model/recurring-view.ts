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
  if (activeCount === 1) {
    return '1 ativa';
  }

  return `${activeCount} ativas`;
}

function buildRecurringRow(recurring: RecurringTransactionDto, tags: TagDto[]): RecurringRow {
  const isIncome = recurring.type === TransactionType.Income;
  const tagName = tags.find((tag) => tag.id === recurring.tagId)?.name ?? recurring.tagId;

  let amountSign: string;
  if (isIncome) {
    amountSign = '+';
  } else {
    amountSign = '−';
  }

  let state: string;
  let stateBg: string;
  let stateFg: string;
  let opacity: number;
  if (recurring.active) {
    state = 'ativa';
    stateBg = Colors.light.accent;
    stateFg = Colors.light.card;
    opacity = 1;
  } else {
    state = 'pausada';
    stateBg = 'transparent';
    stateFg = Colors.light.muted;
    opacity = PausedRowOpacity;
  }

  return {
    id: recurring.id,
    name: recurring.description ?? tagName,
    meta: buildRecurringMeta(recurring),
    amount: `${amountSign} ${formatAmount(recurring.amount)}`,
    tag: tagName,
    state,
    stateBg,
    stateFg,
    opacity,
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
