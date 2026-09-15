import { act, renderHook } from '@testing-library/react-native';

import { SelectedMonthProvider, useSelectedMonth } from './selected-month-context';

function renderSelectedMonth() {
  return renderHook(() => useSelectedMonth(), { wrapper: SelectedMonthProvider });
}

describe('useSelectedMonth', () => {
  test('throws when used outside a SelectedMonthProvider', async () => {
    await expect(renderHook(() => useSelectedMonth())).rejects.toThrow(/SelectedMonthProvider/);
  });

  test('starts on the current year and month', async () => {
    const { result } = await renderSelectedMonth();
    const today = new Date();

    expect(result.current.year).toBe(today.getFullYear());
    expect(result.current.month).toBe(today.getMonth() + 1);
  });

  test('goToNextMonth then goToPreviousMonth returns to the starting month', async () => {
    const { result } = await renderSelectedMonth();
    const startingYear = result.current.year;
    const startingMonth = result.current.month;

    await act(async () => result.current.goToNextMonth());
    await act(async () => result.current.goToPreviousMonth());

    expect(result.current.year).toBe(startingYear);
    expect(result.current.month).toBe(startingMonth);
  });

  test('goToPreviousMonth from January rolls back to December of the previous year', async () => {
    const { result } = await renderSelectedMonth();

    while (result.current.month !== 1) {
      await act(async () => result.current.goToNextMonth());
    }
    const yearAtJanuary = result.current.year;

    await act(async () => result.current.goToPreviousMonth());

    expect(result.current.year).toBe(yearAtJanuary - 1);
    expect(result.current.month).toBe(12);
  });

  test('goToNextMonth from December rolls forward to January of the next year', async () => {
    const { result } = await renderSelectedMonth();

    while (result.current.month !== 12) {
      await act(async () => result.current.goToNextMonth());
    }
    const yearAtDecember = result.current.year;

    await act(async () => result.current.goToNextMonth());

    expect(result.current.year).toBe(yearAtDecember + 1);
    expect(result.current.month).toBe(1);
  });
});
