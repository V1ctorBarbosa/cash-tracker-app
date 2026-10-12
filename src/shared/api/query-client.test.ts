import { QueryClient } from '@tanstack/react-query';

import type { AuthGateway, AuthUser } from './auth-gateway';
import { clearQueryCacheOnSignOut, queryClient } from './query-client';

type AuthListener = (user: AuthUser | null) => void;

function createAuthGatewayStub(): { gateway: AuthGateway; emit: AuthListener; unsubscribe: jest.Mock } {
  let listener: AuthListener = () => {};
  const unsubscribe = jest.fn();
  const gateway: AuthGateway = {
    subscribe: (newListener) => {
      listener = newListener;
      return unsubscribe;
    },
    getIdToken: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  };

  return { gateway, emit: (user) => listener(user), unsubscribe };
}

const SignedInUser: AuthUser = { uid: 'user-123', email: 'victor@example.com', displayName: 'Victor' };
const CachedTagsKey = ['tags'];

describe('queryClient', () => {
  test('keeps fetched responses fresh for five minutes by default', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
  });
});

describe('clearQueryCacheOnSignOut', () => {
  test('clears every cached response when the user signs out', () => {
    const client = new QueryClient();
    client.setQueryData(CachedTagsKey, ['tag-moradia']);
    const { gateway, emit } = createAuthGatewayStub();

    clearQueryCacheOnSignOut(gateway, client);
    emit(null);

    expect(client.getQueryData(CachedTagsKey)).toBeUndefined();
  });

  test('keeps the cache when a user is signed in', () => {
    const client = new QueryClient();
    client.setQueryData(CachedTagsKey, ['tag-moradia']);
    const { gateway, emit } = createAuthGatewayStub();

    clearQueryCacheOnSignOut(gateway, client);
    emit(SignedInUser);

    expect(client.getQueryData(CachedTagsKey)).toEqual(['tag-moradia']);
  });

  test('returns the auth gateway unsubscribe', () => {
    const { gateway, unsubscribe } = createAuthGatewayStub();

    const returnedUnsubscribe = clearQueryCacheOnSignOut(gateway, new QueryClient());
    returnedUnsubscribe();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
