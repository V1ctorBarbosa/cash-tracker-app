import { Colors } from '@/constants/theme';
import type { TagDto } from '@/entities/tag';
import { getPaymentMethodLabel, TransactionType, type TransactionDto } from '@/entities/transaction';
import { formatDateRangeBR, formatMonthLong, getMonthDateRange } from '@/shared/lib/date';
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

export type DateRange = { from: string; to: string };
export type HistoryPeriod = { range: DateRange; label: string };
export type DeleteMonthPrompt = { title: string; message: string; confirmLabel: string };

const DeleteMonthButtonLabel = 'apagar mês';
const DeletingMonthButtonLabel = 'apagando…';
const DeleteConfirmLabel = 'Apagar';

/** The date range the page queries and the label shown for it: a custom range when one was picked, otherwise the selected month. */
export function resolveHistoryPeriod(customRange: DateRange | null, year: number, month: number): HistoryPeriod {
  if (customRange !== null) {
    return { range: customRange, label: formatDateRangeBR(customRange) };
  }

  return { range: getMonthDateRange(year, month), label: formatMonthLong(year, month) };
}

/** Deleting wipes a whole calendar month, so it is only offered for the selected month (not a custom range) and only when there is something to delete. */
export function canDeleteMonth(customRange: DateRange | null, monthTransactionCount: number): boolean {
  return customRange === null && monthTransactionCount > 0;
}

export function buildDeleteMonthButtonLabel(isDeleting: boolean): string {
  if (isDeleting) {
    return DeletingMonthButtonLabel;
  }

  return DeleteMonthButtonLabel;
}

/** `monthTransactionCount` must be the month's full count, not the filtered list's: the delete ignores the search text and filter chips. */
export function buildDeleteMonthPrompt(monthLabel: string, monthTransactionCount: number): DeleteMonthPrompt {
  let countPhrase: string;
  if (monthTransactionCount === 1) {
    countPhrase = `1 lançamento de ${monthLabel} será apagado`;
  } else {
    countPhrase = `${monthTransactionCount} lançamentos de ${monthLabel} serão apagados`;
  }

  return {
    title: `Apagar ${monthLabel}?`,
    message: `${countPhrase} de forma permanente, inclusive os recorrentes, que não voltam a aparecer neste mês. Isso não pode ser desfeito.`,
    confirmLabel: DeleteConfirmLabel,
  };
}

export function buildDeletedTransactionsToast(deletedCount: number): string {
  if (deletedCount === 0) {
    return 'Nenhum lançamento apagado';
  }
  if (deletedCount === 1) {
    return '1 lançamento apagado';
  }

  return `${deletedCount} lançamentos apagados`;
}

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
