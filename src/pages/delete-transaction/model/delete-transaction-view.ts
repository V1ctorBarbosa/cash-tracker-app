import type { TagDto } from '@/entities/tag';
import { getPaymentMethodLabel, TransactionType, type TransactionDto } from '@/entities/transaction';
import { formatDateBR } from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/format';

export type DeleteSummary = { headline: string; typeLabel: string; signedAmount: string; metaLine: string };

/** The transaction summary shown on the delete-confirmation screen, so the user can double-check what they're about to remove. */
export function buildDeleteSummary(transaction: TransactionDto, tags: TagDto[]): DeleteSummary {
  const tagName = tags.find((tag) => tag.id === transaction.tagId)?.name ?? transaction.tagId;

  let amountSign: string;
  let typeLabel: string;
  if (transaction.type === TransactionType.Income) {
    amountSign = '+';
    typeLabel = 'receita';
  } else {
    amountSign = '−';
    typeLabel = 'despesa';
  }

  let headline: string;
  if (transaction.description !== null) {
    headline = transaction.description;
  } else {
    headline = tagName;
  }

  return {
    headline,
    typeLabel,
    signedAmount: `${amountSign} ${formatAmount(transaction.amount)}`,
    metaLine: `${tagName} · ${getPaymentMethodLabel(transaction.paymentMethod)} · ${formatDateBR(transaction.date)}`,
  };
}
