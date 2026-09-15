import { Colors } from '@/constants/theme';
import type { TagDto } from '@/entities/tag';
import { getPaymentMethodLabel, TransactionType, type TransactionDto } from '@/entities/transaction';
import { formatAmount } from '@/shared/lib/format';
import { normalizeSearchText } from '@/shared/lib/text';

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
  metaLine: string;
  amount: string;
  amountColor: string;
};

export type HistorySummary = { total: string; items: HistoryItem[] };

export function filterTransactions(transactions: TransactionDto[], tags: TagDto[], searchText: string, filter: HistoryFilter): TransactionDto[] {
  const normalizedSearch = normalizeSearchText(searchText);

  return transactions.filter((transaction) => {
    if (normalizedSearch.length > 0 && !normalizeSearchText(resolveDescription(transaction, tags)).includes(normalizedSearch)) {
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

/** Newest day first -- matching the design's ordering. Callers already scope `transactions` to one month via the query's from/to range. */
export function buildHistorySummary(transactions: TransactionDto[], tags: TagDto[]): HistorySummary {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return {
    total: buildMonthTotal(sorted),
    items: sorted.map((transaction) => buildHistoryItem(transaction, tags)),
  };
}

function buildMonthTotal(monthTransactions: TransactionDto[]): string {
  const balance = monthTransactions.reduce((sum, transaction) => sum + signedAmount(transaction), 0);

  let balanceSign: string;
  if (balance >= 0) {
    balanceSign = '+';
  } else {
    balanceSign = '−';
  }

  return `saldo ${balanceSign} ${formatAmount(Math.abs(balance))}`;
}

function signedAmount(transaction: TransactionDto): number {
  if (transaction.type === TransactionType.Income) {
    return transaction.amount;
  }

  return -transaction.amount;
}

function buildHistoryItem(transaction: TransactionDto, tags: TagDto[]): HistoryItem {
  const isIncome = transaction.type === TransactionType.Income;
  const isRecurring = transaction.recurringTransactionId !== null;
  const tagName = tags.find((tag) => tag.id === transaction.tagId)?.name ?? transaction.tagId;

  let dot: string;
  let amountSign: string;
  let amountColor: string;
  if (isIncome) {
    dot = Colors.light.accent;
    amountSign = '+';
    amountColor = Colors.light.accent;
  } else {
    dot = '#b9b3a1';
    amountSign = '−';
    amountColor = Colors.light.ink;
  }

  return {
    id: transaction.id,
    day: transaction.date.slice(8, 10),
    dot,
    desc: transaction.description ?? tagName,
    metaLine: buildMetaLine(tagName, getPaymentMethodLabel(transaction.paymentMethod), isRecurring),
    amount: `${amountSign} ${formatAmount(transaction.amount)}`,
    amountColor,
  };
}

function buildMetaLine(tagName: string, paymentMethodLabel: string, isRecurring: boolean): string {
  let metaLine = `${tagName} · ${paymentMethodLabel}`;
  if (isRecurring) {
    metaLine = `${metaLine} recorrente`;
  }

  return metaLine;
}

/** The description shown for a transaction -- falls back to the tag name when it has none. */
function resolveDescription(transaction: TransactionDto, tags: TagDto[]): string {
  if (transaction.description !== null) {
    return transaction.description;
  }

  return tags.find((tag) => tag.id === transaction.tagId)?.name ?? transaction.tagId;
}
