import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getJson, putJson } from '@/shared/api/http-client';

export type BudgetDto = { id: string; tagId: string; month: string; limitAmount: number };

const DashboardQueryKeyPrefix = ['dashboard'] as const;

/** Every budget across every month, so a caller can check "does this tag have any budget at all" without a month in mind. */
export function useBudgets() {
  return useQuery({ queryKey: ['budgets'] as const, queryFn: () => getJson<BudgetDto[]>('/budgets') });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, month, limitAmount }: { tagId: string; month: string; limitAmount: number }) =>
      putJson<{ limitAmount: number }, BudgetDto>(`/budgets/${tagId}/${month}`, { limitAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DashboardQueryKeyPrefix });
    },
  });
}
