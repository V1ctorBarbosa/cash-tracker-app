import type { BudgetProgressDto } from '@/entities/dashboard';
import { Colors } from '@/constants/theme';
import { formatAmount } from '@/shared/lib/format';

const FullBudgetThresholdPct = 100;

export type BudgetBar = {
  tagId: string;
  name: string;
  // Plain number (0-100), not a "45%" string -- see the comment on CategoryBar.widthPct in
  // pages/dashboard/model/dashboard-view.ts for why.
  pct: number;
  color: string;
  note: string;
  noteColor: string;
  actual: string;
  limit: string;
};

export function buildBudgetBars(budgets: BudgetProgressDto[]): BudgetBar[] {
  return budgets.map((budget) => {
    const pct = budget.limitAmount === 0 ? 0 : Math.min(FullBudgetThresholdPct, Math.round((budget.actualAmount / budget.limitAmount) * 100));
    const isFull = pct >= FullBudgetThresholdPct;

    return {
      tagId: budget.tagId,
      name: budget.tagName,
      pct,
      color: isFull ? Colors.light.danger : Colors.light.accent,
      note: isFull ? 'no limite' : `${FullBudgetThresholdPct - pct}% livre`,
      noteColor: isFull ? Colors.light.danger : Colors.light.muted,
      actual: formatAmount(budget.actualAmount),
      limit: formatAmount(budget.limitAmount),
    };
  });
}

export function buildTotals(budgets: BudgetProgressDto[], totalExpense: number): { totalLimit: string; used: string } {
  const totalLimit = budgets.reduce((sum, budget) => sum + budget.limitAmount, 0);
  return { totalLimit: formatAmount(totalLimit), used: formatAmount(totalExpense) };
}
