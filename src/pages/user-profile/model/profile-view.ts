import type { TransactionStatisticsDto } from '@/entities/transaction';
import { formatMonthShort } from '@/shared/lib/date';

const NoTransactionsSinceLabel = '—';

export function computeTransactionStats(statistics: TransactionStatisticsDto): { count: number; sinceLabel: string } {
  if (statistics.firstTransactionDate === null) {
    return { count: statistics.transactionCount, sinceLabel: NoTransactionsSinceLabel };
  }

  const [year, month] = statistics.firstTransactionDate.split('-').map(Number);

  return { count: statistics.transactionCount, sinceLabel: formatMonthShort(year, month) };
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
