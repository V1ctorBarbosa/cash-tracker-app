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

export function useDashboard(from: string, to: string) {
  return useQuery({
    queryKey: ['dashboard', from, to] as const,
    queryFn: () => getJson<DashboardDto>(`/dashboard?from=${from}&to=${to}`),
  });
}
