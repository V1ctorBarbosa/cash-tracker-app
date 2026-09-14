import { useMutation, useQueryClient } from '@tanstack/react-query';

import { putJson } from '@/shared/api/http-client';

export type BudgetDto = { id: string; tagId: string; month: string; limitAmount: number };

const DashboardQueryKeyPrefix = ['dashboard'] as const;

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
