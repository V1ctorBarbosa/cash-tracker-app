import { useQuery } from '@tanstack/react-query';

import { getJson } from '@/shared/api/http-client';

export type MonthlySummaryDto = { month: string; income: number; expense: number };
export type TagAmountDto = { tagId: string; tagName: string; tagColor: string; amount: number };
export type PaymentMethodAmountDto = { paymentMethod: string; amount: number };
export type BudgetProgressDto = {
  tagId: string;
  tagName: string;
  tagColor: string;
  month: string;
  limitAmount: number;
  actualAmount: number;
};

export type DashboardDto = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlySummary: MonthlySummaryDto[];
  spendByTag: TagAmountDto[];
  spendByPaymentMethod: PaymentMethodAmountDto[];
  budgets: BudgetProgressDto[];
};

/**
 * Every figure covers [from, to]; `trendFrom`, when given, only extends `monthlySummary` further
 * back -- so a single request serves one month's breakdown alongside a longer trend.
 */
export type DashboardFilter = { from: string; to: string; trendFrom?: string };

export function buildDashboardUrl(filter: DashboardFilter): string {
  const params = new URLSearchParams({ from: filter.from, to: filter.to });
  if (filter.trendFrom !== undefined) {
    params.set('trendFrom', filter.trendFrom);
  }

  return `/dashboard?${params.toString()}`;
}

export function useDashboard(filter: DashboardFilter) {
  return useQuery({
    queryKey: ['dashboard', filter.from, filter.to, filter.trendFrom ?? null] as const,
    queryFn: () => getJson<DashboardDto>(buildDashboardUrl(filter)),
  });
}
