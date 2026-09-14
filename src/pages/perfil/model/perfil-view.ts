import type { TransactionDto } from '@/entities/transaction';
import { formatMonthShort } from '@/shared/lib/date';

const NoTransactionsSinceLabel = '—';

export function computeTransactionStats(transactions: TransactionDto[]): { count: number; sinceLabel: string } {
  if (transactions.length === 0) {
    return { count: 0, sinceLabel: NoTransactionsSinceLabel };
  }

  const earliestDate = transactions.reduce((earliest, transaction) => (transaction.date < earliest ? transaction.date : earliest), transactions[0].date);
  const [year, month] = earliestDate.split('-').map(Number);

  return { count: transactions.length, sinceLabel: formatMonthShort(year, month) };
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
