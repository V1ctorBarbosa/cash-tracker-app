import type { TagDto } from '@/entities/tag';
import { getPaymentMethodLabel, TransactionType, type TransactionDto } from '@/entities/transaction';
import { formatDateBR, formatDateTimeBR } from '@/shared/lib/date';

const IdPreviewLength = 8;

export type DetailRow = { label: string; value: string };

export function buildDetailRows(transaction: TransactionDto, tags: TagDto[]): DetailRow[] {
  const tagName = tags.find((tag) => tag.id === transaction.tagId)?.name ?? transaction.tagId;
  const recurrenceLabel = transaction.recurringTransactionId === null ? 'lançamento único' : 'transação recorrente';

  return [
    { label: 'categoria', value: tagName },
    { label: 'forma de pagamento', value: getPaymentMethodLabel(transaction.paymentMethod) },
    { label: 'data', value: formatDateBR(transaction.date) },
    { label: 'recorrência', value: recurrenceLabel },
    { label: 'registrado em', value: formatDateTimeBR(transaction.createdAt) },
    { label: 'id', value: transaction.id.slice(0, IdPreviewLength) },
  ];
}

export function typeLabel(type: TransactionDto['type']): string {
  return type === TransactionType.Income ? 'receita' : 'despesa';
}
