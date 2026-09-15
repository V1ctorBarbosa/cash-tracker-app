import type { TagDto } from '@/entities/tag';
import { TransactionType } from '@/entities/transaction';

/** Other tags of the same kind a deleted tag's transactions could be reassigned to. */
export function findReplacementCandidates(tags: TagDto[], currentTagId: string | undefined, kind: TransactionType): TagDto[] {
  return tags.filter((tag) => tag.id !== currentTagId && tag.kind === kind);
}
