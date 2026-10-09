import { authGateway } from '@/shared/api/auth-gateway';

import { ApiError, deleteJson } from './http-client';

jest.mock('@/shared/api/auth-gateway', () => ({ authGateway: { getIdToken: jest.fn() } }));
jest.mock('@/shared/config/api-config', () => ({ apiBaseUrl: 'https://api.test' }));

const mockedGetIdToken = authGateway.getIdToken as jest.Mock;
const mockedFetch = jest.fn();

function jsonResponse(status: number, body: unknown): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

describe('deleteJson', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedGetIdToken.mockReset();
    mockedGetIdToken.mockResolvedValue('token-123');
    global.fetch = mockedFetch;
  });

  test('sends an authenticated DELETE to the base URL plus the path', async () => {
    mockedFetch.mockResolvedValue(jsonResponse(200, { deletedCount: 3 }));

    await deleteJson('/transactions?from=2026-09-01&to=2026-09-30');

    expect(mockedFetch).toHaveBeenCalledWith('https://api.test/transactions?from=2026-09-01&to=2026-09-30', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token-123' },
    });
  });

  test('returns the parsed JSON body of a successful response', async () => {
    mockedFetch.mockResolvedValue(jsonResponse(200, { deletedCount: 3 }));

    const result = await deleteJson<{ deletedCount: number }>('/transactions');

    expect(result).toEqual({ deletedCount: 3 });
  });

  test('throws an ApiError carrying the backend error body when the response is not ok', async () => {
    mockedFetch.mockResolvedValue(jsonResponse(400, { errorCode: 'invalid_request', message: 'The start date must not be after the end date.' }));

    const failure = deleteJson('/transactions').catch((error: unknown) => error);

    await expect(failure).resolves.toBeInstanceOf(ApiError);
    await expect(failure).resolves.toMatchObject({ status: 400, errorCode: 'invalid_request' });
  });

  test('refuses to call the API when there is no signed-in user', async () => {
    mockedGetIdToken.mockResolvedValue(null);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(deleteJson('/transactions')).rejects.toThrow('signed-in user');
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
