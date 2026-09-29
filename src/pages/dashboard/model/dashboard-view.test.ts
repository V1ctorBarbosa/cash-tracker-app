import { buildCategoryDonut, buildMonthBars, buildPaymentMethodSegments } from './dashboard-view';

// getPaymentMethodLabel (used by buildPaymentMethodSegments) lives in a module that also
// exports TanStack Query hooks importing the Firebase client -- mocked so this pure logic can
// be tested without pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

describe('buildCategoryDonut', () => {
  test('sorts segments by amount descending and formats the total', () => {
    const donut = buildCategoryDonut([
      { tagId: 'tag-mercado', tagName: 'Mercado', tagColor: '#EF4444', amount: 89.9 },
      { tagId: 'tag-moradia', tagName: 'Moradia', tagColor: '#3B82F6', amount: 1800 },
      { tagId: 'tag-lazer', tagName: 'Lazer', tagColor: '#10B981', amount: 45 },
    ]);

    expect(donut.segments.map((segment) => segment.tagId)).toEqual(['tag-moradia', 'tag-mercado', 'tag-lazer']);
    expect(donut.totalLabel).toBe('1.934,90');
  });

  test('scales each segment as a share of the total, rounded to a whole-number percentage label', () => {
    const donut = buildCategoryDonut([
      { tagId: 'tag-moradia', tagName: 'Moradia', tagColor: '#3B82F6', amount: 750 },
      { tagId: 'tag-mercado', tagName: 'Mercado', tagColor: '#EF4444', amount: 250 },
    ]);

    expect(donut.segments[0].lengthFraction).toBeCloseTo(0.75);
    expect(donut.segments[0].percentageLabel).toBe('75%');
    expect(donut.segments[1].lengthFraction).toBeCloseTo(0.25);
    expect(donut.segments[1].percentageLabel).toBe('25%');
  });

  test('stacks each segment right after the previous one, so offsets cover the full circle with no gaps', () => {
    const donut = buildCategoryDonut([
      { tagId: 'tag-moradia', tagName: 'Moradia', tagColor: '#3B82F6', amount: 60 },
      { tagId: 'tag-mercado', tagName: 'Mercado', tagColor: '#EF4444', amount: 40 },
    ]);

    expect(donut.segments[0].offsetFraction).toBe(0);
    expect(donut.segments[1].offsetFraction).toBeCloseTo(0.6);
  });

  test("colors each segment by the tag's own real color, never by its position in the list", () => {
    const donut = buildCategoryDonut([
      { tagId: 'tag-moradia', tagName: 'Moradia', tagColor: '#3B82F6', amount: 10 },
      { tagId: 'tag-mercado', tagName: 'Mercado', tagColor: '#EF4444', amount: 5 },
    ]);

    expect(donut.segments.find((segment) => segment.tagId === 'tag-moradia')?.color).toBe('#3B82F6');
    expect(donut.segments.find((segment) => segment.tagId === 'tag-mercado')?.color).toBe('#EF4444');
  });

  test('returns no segments and a zero total, with no division by zero, when there is no spend', () => {
    const donut = buildCategoryDonut([]);

    expect(donut.segments).toEqual([]);
    expect(donut.totalLabel).toBe('0,00');
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
