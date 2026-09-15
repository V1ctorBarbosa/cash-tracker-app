import { Colors } from '@/constants/theme';
import type { TagDto } from '@/entities/tag';
import { getPaymentMethodLabel, TransactionType, type TransactionDto } from '@/entities/transaction';
import { formatMonthLong } from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/format';

export const HistoryFilter = {
  All: 'tudo',
  Expenses: 'despesas',
  Income: 'receitas',
  Recurring: 'recorrentes',
} as const;
export type HistoryFilter = (typeof HistoryFilter)[keyof typeof HistoryFilter];

export type HistoryItem = {
  id: string;
  day: string;
  dot: string;
  desc: string;
  tag: string;
  method: string;
  rec: string;
  amount: string;
  amountColor: string;
};

export type HistoryGroup = { month: string; total: string; items: HistoryItem[] };

export function filterTransactions(transactions: TransactionDto[], tags: TagDto[], searchText: string, filter: HistoryFilter): TransactionDto[] {
  const normalizedSearch = searchText.trim().toLowerCase();

  return transactions.filter((transaction) => {
    if (normalizedSearch.length > 0 && !resolveDescription(transaction, tags).toLowerCase().includes(normalizedSearch)) {
      return false;
    }
    if (filter === HistoryFilter.Expenses && transaction.type !== TransactionType.Expense) {
      return false;
    }
    if (filter === HistoryFilter.Income && transaction.type !== TransactionType.Income) {
      return false;
    }
    if (filter === HistoryFilter.Recurring && transaction.recurringTransactionId === null) {
      return false;
    }

    return true;
  });
}

/** Newest month first; within a month, newest day first -- matching the design's ordering. */
export function groupByMonth(transactions: TransactionDto[], tags: TagDto[]): HistoryGroup[] {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const transactionsByMonth = new Map<string, TransactionDto[]>();

  for (const transaction of sorted) {
    const monthKey = transaction.date.slice(0, 7);
    const monthTransactions = transactionsByMonth.get(monthKey) ?? [];
    monthTransactions.push(transaction);
    transactionsByMonth.set(monthKey, monthTransactions);
  }

  return [...transactionsByMonth.entries()].map(([monthKey, monthTransactions]) => {
    const [year, month] = monthKey.split('-').map(Number);
    const balance = monthTransactions.reduce(
      (sum, transaction) => sum + (transaction.type === TransactionType.Income ? transaction.amount : -transaction.amount),
      0,
    );

    return {
      month: formatMonthLong(year, month),
      total: `saldo ${balance >= 0 ? '+' : '−'} ${formatAmount(Math.abs(balance))}`,
      items: monthTransactions.map((transaction) => buildHistoryItem(transaction, tags)),
    };
  });
}

function buildHistoryItem(transaction: TransactionDto, tags: TagDto[]): HistoryItem {
  const isIncome = transaction.type === TransactionType.Income;
  const tagName = tags.find((tag) => tag.id === transaction.tagId)?.name ?? transaction.tagId;

  return {
    id: transaction.id,
    day: transaction.date.slice(8, 10),
    dot: isIncome ? Colors.light.accent : '#b9b3a1',
    desc: transaction.description ?? tagName,
    tag: tagName,
    method: getPaymentMethodLabel(transaction.paymentMethod),
    rec: transaction.recurringTransactionId !== null ? 'recorrente' : '',
    amount: `${isIncome ? '+' : '−'} ${formatAmount(transaction.amount)}`,
    amountColor: isIncome ? Colors.light.accent : Colors.light.ink,
  };
}

/** The description shown for a transaction -- falls back to the tag name when it has none. */
function resolveDescription(transaction: TransactionDto, tags: TagDto[]): string {
  if (transaction.description !== null) {
    return transaction.description;
  }

  return tags.find((tag) => tag.id === transaction.tagId)?.name ?? transaction.tagId;
}
