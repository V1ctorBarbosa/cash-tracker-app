import { ApiError } from '@/shared/api/http-client';

import { isUserProfileNotFound } from './user-profile';

// This module also exports TanStack Query hooks that import the Firebase client -- mocked here
// so this file's pure function can be tested without pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

describe('isUserProfileNotFound', () => {
  test('returns true for a 404 ApiError', () => {
    expect(isUserProfileNotFound(new ApiError(404, 'Not Found'))).toBe(true);
  });

  test('returns false for a non-404 ApiError', () => {
    expect(isUserProfileNotFound(new ApiError(500, 'Server Error'))).toBe(false);
  });

  test('returns false for a value that is not an ApiError', () => {
    expect(isUserProfileNotFound(new Error('network down'))).toBe(false);
  });
});
