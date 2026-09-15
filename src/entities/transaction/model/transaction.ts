import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteRequest, getJson, postJson, putJson } from '@/shared/api/http-client';

export const TransactionType = { Income: 'Income', Expense: 'Expense' } as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentMethod = {
  Pix: 'Pix',
  Dinheiro: 'Dinheiro',
  CartaoDebito: 'CartaoDebito',
  CartaoCredito: 'CartaoCredito',
  TransferenciaBancaria: 'TransferenciaBancaria',
  Boleto: 'Boleto',
  Outro: 'Outro',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Pix]: 'Pix',
  [PaymentMethod.Dinheiro]: 'Dinheiro',
  [PaymentMethod.CartaoDebito]: 'Cartão Débito',
  [PaymentMethod.CartaoCredito]: 'Cartão Crédito',
  [PaymentMethod.TransferenciaBancaria]: 'Transferência',
  [PaymentMethod.Boleto]: 'Boleto',
  [PaymentMethod.Outro]: 'Outro',
};

export function getPaymentMethodLabel(paymentMethod: string): string {
  return PaymentMethodLabels[paymentMethod as PaymentMethod] ?? paymentMethod;
}

export type TransactionDto = {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  tagId: string;
  paymentMethod: PaymentMethod;
  recurringTransactionId: string | null;
  createdAt: string;
};

export type CreateTransactionRequest = {
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  tagId: string;
  paymentMethod: PaymentMethod;
};

/**
 * All filters optional -- omitting `from`/`to` fetches every transaction that already exists with
 * no date bound, but (unlike passing a wide "all time" range) does NOT trigger recurring-transaction
 * materialization, which only runs when both `from` and `to` are given (Section 12). Screens that
 * just need a count or a tag-usage check should omit them rather than faking a bounded range.
 */
export type TransactionsFilter = { from?: string; to?: string; tagId?: string };

const TransactionsQueryKey = (filter: TransactionsFilter) =>
  ['transactions', filter.from ?? null, filter.to ?? null, filter.tagId ?? null] as const;

export function buildTransactionsUrl(filter: TransactionsFilter): string {
  const params = new URLSearchParams();
  if (filter.from !== undefined) {
    params.set('from', filter.from);
  }
  if (filter.to !== undefined) {
    params.set('to', filter.to);
  }
  if (filter.tagId !== undefined) {
    params.set('tagId', filter.tagId);
  }

  const queryString = params.toString();
  if (queryString.length === 0) {
    return '/transactions';
  }

  return `/transactions?${queryString}`;
}

const DashboardQueryKeyPrefix = ['dashboard'] as const;

export function useTransactions(filter: TransactionsFilter = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: TransactionsQueryKey(filter),
    queryFn: () => getJson<TransactionDto[]>(buildTransactionsUrl(filter)),
    enabled: options.enabled,
  });
}

export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['transactions', transactionId] as const,
    queryFn: () => getJson<TransactionDto>(`/transactions/${transactionId}`),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTransactionRequest) => postJson<CreateTransactionRequest, TransactionDto>('/transactions', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: DashboardQueryKeyPrefix });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, request }: { transactionId: string; request: CreateTransactionRequest }) =>
      putJson<CreateTransactionRequest, TransactionDto>(`/transactions/${transactionId}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: DashboardQueryKeyPrefix });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => deleteRequest(`/transactions/${transactionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: DashboardQueryKeyPrefix });
    },
  });
}
