import { useEffect } from 'react';

import type { AuthUser } from '@/shared/api/auth-gateway';

import { isUserProfileNotFound, useUpsertUserProfile, useUserProfile } from './user-profile';

/**
 * Provisions the backend's User record the first time a signed-in user is seen with no profile
 * yet -- the same lazy, check-then-create-if-missing pattern already used for recurring
 * transactions and the uncategorized tags, just for the User entity instead. Silent and best
 * effort: there is no UI surface for this, and a signed-in user with no name/email from the
 * provider yet just waits for the next render where those are populated.
 */
export function useSyncUserProfile(authUser: AuthUser): void {
  const profile = useUserProfile();
  const upsertProfile = useUpsertUserProfile();

  useEffect(() => {
    if (!profile.isError || !isUserProfileNotFound(profile.error)) {
      return;
    }

    if (authUser.displayName === null || authUser.email === null) {
      return;
    }

    if (upsertProfile.isPending) {
      return;
    }

    upsertProfile.mutate({ name: authUser.displayName, email: authUser.email });
  }, [authUser.displayName, authUser.email, profile.isError, profile.error, upsertProfile]);
}
