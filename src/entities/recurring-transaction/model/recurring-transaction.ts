import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getJson, postJson } from '@/shared/api/http-client';
import type { PaymentMethod, TransactionType } from '@/entities/transaction';

export type RecurringTransactionDto = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  tagId: string;
  paymentMethod: PaymentMethod;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  active: boolean;
};

export type CreateRecurringTransactionRequest = {
  type: TransactionType;
  amount: number;
  description: string;
  tagId: string;
  paymentMethod: PaymentMethod;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
};

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ['recurring-transactions'] as const,
    queryFn: () => getJson<RecurringTransactionDto[]>('/recurring-transactions'),
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRecurringTransactionRequest) =>
      postJson<CreateRecurringTransactionRequest, RecurringTransactionDto>('/recurring-transactions', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
