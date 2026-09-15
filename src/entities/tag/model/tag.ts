import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteRequest, getJson, postJson, putJson } from '@/shared/api/http-client';
import type { TransactionType } from '@/entities/transaction';

export type TagDto = { id: string; name: string; color: string; kind: TransactionType };

export type UpsertTagRequest = { name: string; color: string; kind: TransactionType };

const TagsQueryKey = ['tags'] as const;
const DashboardQueryKeyPrefix = ['dashboard'] as const;
const BudgetsQueryKey = ['budgets'] as const;

export function useTags() {
  return useQuery({ queryKey: TagsQueryKey, queryFn: () => getJson<TagDto[]>('/tags') });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertTagRequest) => postJson<UpsertTagRequest, TagDto>('/tags', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TagsQueryKey });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, request }: { tagId: string; request: UpsertTagRequest }) =>
      putJson<UpsertTagRequest, TagDto>(`/tags/${tagId}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TagsQueryKey });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => deleteRequest(`/tags/${tagId}`),
    onSuccess: () => {
      // Deleting a tag also deletes every budget set for it (server-side cascade) -- both caches
      // need to drop the now-gone data, not just the tag list itself.
      queryClient.invalidateQueries({ queryKey: TagsQueryKey });
      queryClient.invalidateQueries({ queryKey: DashboardQueryKeyPrefix });
      queryClient.invalidateQueries({ queryKey: BudgetsQueryKey });
    },
  });
}
