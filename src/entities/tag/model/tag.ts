import { useQuery } from '@tanstack/react-query';

import { getJson } from '@/shared/api/http-client';

export type TagDto = { id: string; name: string; color: string };

const TagsQueryKey = ['tags'] as const;

export function useTags() {
  return useQuery({ queryKey: TagsQueryKey, queryFn: () => getJson<TagDto[]>('/tags') });
}
