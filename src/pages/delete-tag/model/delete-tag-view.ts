import { TransactionType } from '@/entities/transaction';

export function tagKindLabel(kind: TransactionType): string {
  if (kind === TransactionType.Income) {
    return 'receita';
  }

  return 'despesa';
}
