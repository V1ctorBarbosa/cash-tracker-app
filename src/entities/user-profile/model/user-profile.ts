import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, getJson, putJson } from '@/shared/api/http-client';

export type UserProfileDto = { id: string; name: string; email: string };

export type UpsertUserProfileRequest = { name: string; email: string };

const UserProfileQueryKey = ['user-profile'] as const;
const NotFoundStatus = 404;

/** No retry: a 404 here means "no profile yet", a deterministic state a retry can't change -- not a transient failure worth the default backoff. */
export function useUserProfile() {
  return useQuery({ queryKey: UserProfileQueryKey, queryFn: () => getJson<UserProfileDto>('/profile'), retry: false });
}

export function useUpsertUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertUserProfileRequest) => putJson<UpsertUserProfileRequest, UserProfileDto>('/profile', request),
    onSuccess: (profile) => {
      queryClient.setQueryData(UserProfileQueryKey, profile);
    },
  });
}

export function isUserProfileNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === NotFoundStatus;
}
