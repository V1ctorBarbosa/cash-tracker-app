import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteRequest, getJson, postJson, putJson } from '@/shared/api/http-client';
import type { TransactionType } from '@/entities/transaction';

export type TagDto = { id: string; name: string; color: string; kind: TransactionType };

export type UpsertTagRequest = { name: string; color: string; kind: TransactionType };

const TagsQueryKey = ['tags'] as const;

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
      queryClient.invalidateQueries({ queryKey: TagsQueryKey });
    },
  });
}
