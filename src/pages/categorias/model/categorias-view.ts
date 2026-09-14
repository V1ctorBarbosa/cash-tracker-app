import type { TagDto } from '@/entities/tag';
import { TransactionType } from '@/entities/transaction';
import type { TransactionDto } from '@/entities/transaction';

export type TagRow = { id: string; name: string; color: string; kindLabel: string; usesLabel: string };

export function buildTagRows(tags: TagDto[], transactions: TransactionDto[]): TagRow[] {
  return tags.map((tag) => {
    const uses = transactions.filter((transaction) => transaction.tagId === tag.id).length;

    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      kindLabel: tag.kind === TransactionType.Income ? 'receita' : 'despesa',
      usesLabel: uses === 1 ? '1 lançamento' : `${uses} lançamentos`,
    };
  });
}
