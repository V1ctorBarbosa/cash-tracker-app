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
  return budgets.map(buildBudgetBar);
}

function buildBudgetBar(budget: BudgetProgressDto): BudgetBar {
  let pct = 0;
  if (budget.limitAmount !== 0) {
    pct = Math.min(FullBudgetThresholdPct, Math.round((budget.actualAmount / budget.limitAmount) * 100));
  }

  const isFull = pct >= FullBudgetThresholdPct;

  let color: string;
  let note: string;
  let noteColor: string;
  if (isFull) {
    color = Colors.light.danger;
    note = 'no limite';
    noteColor = Colors.light.danger;
  } else {
    color = Colors.light.accent;
    note = `${FullBudgetThresholdPct - pct}% livre`;
    noteColor = Colors.light.muted;
  }

  return {
    tagId: budget.tagId,
    name: budget.tagName,
    pct,
    color,
    note,
    noteColor,
    actual: formatAmount(budget.actualAmount),
    limit: formatAmount(budget.limitAmount),
  };
}

export function buildTotals(budgets: BudgetProgressDto[], totalExpense: number): { totalLimit: string; used: string } {
  const totalLimit = budgets.reduce((sum, budget) => sum + budget.limitAmount, 0);
  return { totalLimit: formatAmount(totalLimit), used: formatAmount(totalExpense) };
}
