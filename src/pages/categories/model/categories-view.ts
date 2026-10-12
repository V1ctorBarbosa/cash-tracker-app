import type { TagDto } from '@/entities/tag';
import { TransactionType } from '@/entities/transaction';
import type { TagUsageDto } from '@/entities/transaction';

export type TagRow = { id: string; name: string; color: string; kindLabel: string; usesLabel: string; isSystemDefined: boolean };

export function buildTagRows(tags: TagDto[], tagUsages: TagUsageDto[]): TagRow[] {
  const usesByTagId = new Map(tagUsages.map((tagUsage) => [tagUsage.tagId, tagUsage.transactionCount]));

  return tags.map((tag) => buildTagRow(tag, usesByTagId.get(tag.id) ?? 0));
}

function buildTagRow(tag: TagDto, uses: number): TagRow {

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

  return { id: tag.id, name: tag.name, color: tag.color, kindLabel, usesLabel, isSystemDefined: tag.isSystemDefined };
}
