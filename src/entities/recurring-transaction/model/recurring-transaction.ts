import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteRequest, getJson, postJson, putJson } from '@/shared/api/http-client';
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

export type UpdateRecurringTransactionRequest = CreateRecurringTransactionRequest & { active: boolean };

const RecurringTransactionsQueryKey = ['recurring-transactions'] as const;

export function useRecurringTransactions() {
  return useQuery({
    queryKey: RecurringTransactionsQueryKey,
    queryFn: () => getJson<RecurringTransactionDto[]>('/recurring-transactions'),
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRecurringTransactionRequest) =>
      postJson<CreateRecurringTransactionRequest, RecurringTransactionDto>('/recurring-transactions', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RecurringTransactionsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recurringTransactionId, request }: { recurringTransactionId: string; request: UpdateRecurringTransactionRequest }) =>
      putJson<UpdateRecurringTransactionRequest, RecurringTransactionDto>(`/recurring-transactions/${recurringTransactionId}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RecurringTransactionsQueryKey });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recurringTransactionId: string) => deleteRequest(`/recurring-transactions/${recurringTransactionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RecurringTransactionsQueryKey });
    },
  });
}
