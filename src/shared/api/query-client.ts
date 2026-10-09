import { QueryClient } from '@tanstack/react-query';

import type { AuthGateway } from './auth-gateway';

/**
 * Every write goes through this app and invalidates the queries it affects, so a cached response
 * only goes stale on its own when the same account changes data from another device -- rare
 * enough that refetching on every screen mount isn't worth the extra API round trips.
 */
const CachedResponseFreshForMs = 5 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: CachedResponseFreshForMs } },
});

/**
 * Drops every cached response as soon as nobody is signed in, so the next account to sign in on
 * this device never sees the previous one's data while its own loads. Returns the unsubscribe.
 */
export function clearQueryCacheOnSignOut(authGateway: AuthGateway, client: QueryClient): () => void {
  return authGateway.subscribe((user) => {
    if (user === null) {
      client.clear();
    }
  });
}
