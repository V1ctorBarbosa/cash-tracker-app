import type { TagDto } from '@/entities/tag';
import { TransactionType } from '@/entities/transaction';
import type { TransactionDto } from '@/entities/transaction';

export type TagRow = { id: string; name: string; color: string; kindLabel: string; usesLabel: string };

export function buildTagRows(tags: TagDto[], transactions: TransactionDto[]): TagRow[] {
  return tags.map((tag) => buildTagRow(tag, transactions));
}

function buildTagRow(tag: TagDto, transactions: TransactionDto[]): TagRow {
  const uses = transactions.filter((transaction) => transaction.tagId === tag.id).length;

  let kindLabel: string;
  if (tag.kind === TransactionType.Income) {
    kindLabel = 'receita';
  } else {
    kindLabel = 'despesa';
  }

  let usesLabel: string;
  if (uses === 1) {
    usesLabel = '1 lançamento';
  } else {
    usesLabel = `${uses} lançamentos`;
  }

  return { id: tag.id, name: tag.name, color: tag.color, kindLabel, usesLabel };
}
