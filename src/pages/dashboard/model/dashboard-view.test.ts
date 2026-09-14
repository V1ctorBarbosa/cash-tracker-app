import { buildCategoryBars, buildMonthBars, buildPaymentMethodSegments } from './dashboard-view';

// getPaymentMethodLabel (used by buildPaymentMethodSegments) lives in a module that also
// exports TanStack Query hooks importing the Firebase client -- mocked so this pure logic can
// be tested without pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

describe('buildCategoryBars', () => {
  test('sorts by amount descending and scales width relative to the largest category', () => {
    const bars = buildCategoryBars([
      { tagId: 'tag-mercado', tagName: 'Mercado', amount: 89.9 },
      { tagId: 'tag-moradia', tagName: 'Moradia', amount: 1800 },
      { tagId: 'tag-lazer', tagName: 'Lazer', amount: 45 },
    ]);

    expect(bars.map((bar) => bar.tagId)).toEqual(['tag-moradia', 'tag-mercado', 'tag-lazer']);
    expect(bars[0].widthPct).toBe(100);
    expect(bars[1].widthPct).toBeCloseTo((89.9 / 1800) * 100);
    expect(bars[0].value).toBe('1.800,00');
  });

  test('returns an empty list, with no division by zero, when there is no spend', () => {
    expect(buildCategoryBars([])).toEqual([]);
  });
});

describe('buildPaymentMethodSegments', () => {
  test('sorts by amount descending and scales width as a share of the total', () => {
    const segments = buildPaymentMethodSegments([
      { paymentMethod: 'Pix', amount: 45 },
      { paymentMethod: 'TransferenciaBancaria', amount: 2100 },
    ]);

    expect(segments.map((segment) => segment.paymentMethod)).toEqual(['TransferenciaBancaria', 'Pix']);
    expect(segments[0].label).toBe('Transferência');
    const totalWidth = segments.reduce((sum, segment) => sum + segment.widthPct, 0);
    expect(totalWidth).toBeCloseTo(100);
  });

  test('assigns a distinct color per segment by position', () => {
    const segments = buildPaymentMethodSegments([
      { paymentMethod: 'Pix', amount: 10 },
      { paymentMethod: 'Boleto', amount: 5 },
    ]);

    expect(segments[0].color).not.toBe(segments[1].color);
  });

  test('returns an empty list, with no division by zero, when there is no spend', () => {
    expect(buildPaymentMethodSegments([])).toEqual([]);
  });
});

describe('buildMonthBars', () => {
  test('scales every bar relative to the single tallest income or expense value in the window', () => {
    const bars = buildMonthBars([
      { month: '2026-08', income: 5200, expense: 2310 },
      { month: '2026-09', income: 6100, expense: 2271 },
    ]);

    expect(bars[1].incomeHeightPct).toBe(100);
    expect(bars[0].incomeHeightPct).toBeCloseTo((5200 / 6100) * 100);
    expect(bars[0].label).toBe('ago 2026');
  });

  test('does not divide by zero when every month is zero-filled', () => {
    const bars = buildMonthBars([{ month: '2026-09', income: 0, expense: 0 }]);

    expect(bars[0].incomeHeightPct).toBe(0);
    expect(bars[0].expenseHeightPct).toBe(0);
  });
});
