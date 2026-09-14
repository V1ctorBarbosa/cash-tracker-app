import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteRequest, getJson, postJson } from '@/shared/api/http-client';

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
  description: string;
  tagId: string;
  paymentMethod: PaymentMethod;
  recurringTransactionId: string | null;
  createdAt: string;
};

export type CreateTransactionRequest = {
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  tagId: string;
  paymentMethod: PaymentMethod;
};

const TransactionsQueryKey = (from: string, to: string) => ['transactions', from, to] as const;
const DashboardQueryKeyPrefix = ['dashboard'] as const;

export function useTransactions(from: string, to: string) {
  return useQuery({
    queryKey: TransactionsQueryKey(from, to),
    queryFn: () => getJson<TransactionDto[]>(`/transactions?from=${from}&to=${to}`),
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
