import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { putJson } from '@/shared/api/http-client';

import { useUpsertBudget } from './budget';

jest.mock('@/shared/api/http-client', () => ({ getJson: jest.fn(), putJson: jest.fn() }));

const mockedPutJson = putJson as jest.Mock;

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useUpsertBudget', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('invalidates both the dashboard and the budget list once the budget is saved', async () => {
    mockedPutJson.mockResolvedValue({ id: 'budget-1', tagId: 'tag-lazer', month: '2026-09', limitAmount: 500 });
    const client = new QueryClient();
    const invalidateQueries = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useUpsertBudget(), { wrapper: createWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync({ tagId: 'tag-lazer', month: '2026-09', limitAmount: 500 });
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['budgets'] });
  });
});
