import type { TagAmountDto } from '@/entities/dashboard';
import type { TagDto } from '@/entities/tag';
import { TransactionType } from '@/entities/transaction';
import { formatMonthShort } from '@/shared/lib/date';

export const TrailingMonthsForAverage = 3;
const FullProgressThresholdPct = 100;

export type MonthOption = { year: number; month: number; label: string };

/** The month before, the given month, and the month after -- matching the design's fixed 3-pill picker. */
export function buildMonthOptions(baseYear: number, baseMonth: number): MonthOption[] {
  return [-1, 0, 1].map((offset) => {
    const date = new Date(baseYear, baseMonth - 1 + offset, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1, label: formatMonthShort(date.getFullYear(), date.getMonth() + 1) };
  });
}

/** Budgets only apply to expense-kind tags -- "Poupança" is a Tag of kind despesa, so it's included. */
export function buildExpenseTags(tags: TagDto[]): TagDto[] {
  return tags.filter((tag) => tag.kind === TransactionType.Expense);
}

/** The average monthly spend on `tagId` across a trailing window already summed by the caller (see getTrailingMonthsRange). */
export function computeTrailingMonthlyAverage(spendByTag: TagAmountDto[], tagId: string): number {
  const totalForTag = spendByTag.find((entry) => entry.tagId === tagId)?.amount ?? 0;
  return totalForTag / TrailingMonthsForAverage;
}

export function computeAveragePct(trailingMonthlyAverage: number, limitAmount: number): number {
  if (limitAmount <= 0) {
    return 0;
  }

  return Math.min(FullProgressThresholdPct, Math.round((trailingMonthlyAverage / limitAmount) * 100));
}
