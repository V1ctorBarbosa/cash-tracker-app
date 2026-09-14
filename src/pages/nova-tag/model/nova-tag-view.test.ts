import type { TagDto } from '@/entities/tag';

import { findReplacementCandidates } from './nova-tag-view';

function createTag(id: string, kind: TagDto['kind']): TagDto {
  return { id, name: `Tag ${id}`, color: '#3f4a35', kind };
}

describe('findReplacementCandidates', () => {
  test('returns other tags that share the given kind', () => {
    const tags = [createTag('tag-1', 'Expense'), createTag('tag-2', 'Expense'), createTag('tag-3', 'Income')];

    const candidates = findReplacementCandidates(tags, 'tag-1', 'Expense');

    expect(candidates).toEqual([createTag('tag-2', 'Expense')]);
  });

  test('excludes the current tag even when currentTagId is undefined', () => {
    const tags = [createTag('tag-1', 'Expense')];

    const candidates = findReplacementCandidates(tags, undefined, 'Expense');

    expect(candidates).toEqual([createTag('tag-1', 'Expense')]);
  });

  test('excludes tags of a different kind', () => {
    const tags = [createTag('tag-1', 'Expense'), createTag('tag-2', 'Income')];

    const candidates = findReplacementCandidates(tags, undefined, 'Income');

    expect(candidates).toEqual([createTag('tag-2', 'Income')]);
  });
});
