import { Colors } from '@/constants/theme';

import { buildBudgetBars, buildTotals } from './orcamento-view';

describe('buildBudgetBars', () => {
  test('computes the percentage used and how much is left, with the accent color, when under the limit', () => {
    const [bar] = buildBudgetBars([{ tagId: 'tag-lazer', tagName: 'Lazer', month: '2026-09', limitAmount: 500, actualAmount: 45 }]);

    expect(bar.pct).toBe(9);
    expect(bar.note).toBe('91% livre');
    expect(bar.color).toBe(Colors.light.accent);
    expect(bar.noteColor).toBe(Colors.light.muted);
  });

  test('caps the percentage at 100 and switches to the danger color when spend meets or exceeds the limit', () => {
    const [bar] = buildBudgetBars([{ tagId: 'tag-moradia', tagName: 'Moradia', month: '2026-09', limitAmount: 1800, actualAmount: 2000 }]);

    expect(bar.pct).toBe(100);
    expect(bar.note).toBe('no limite');
    expect(bar.color).toBe(Colors.light.danger);
    expect(bar.noteColor).toBe(Colors.light.danger);
  });

  test('does not divide by zero when the limit is zero', () => {
    const [bar] = buildBudgetBars([{ tagId: 'tag-lazer', tagName: 'Lazer', month: '2026-09', limitAmount: 0, actualAmount: 0 }]);

    expect(bar.pct).toBe(0);
  });
});

describe('buildTotals', () => {
  test('sums every budget limit and formats the given total expense as "used"', () => {
    const totals = buildTotals(
      [
        { tagId: 'tag-moradia', tagName: 'Moradia', month: '2026-09', limitAmount: 1800, actualAmount: 1800 },
        { tagId: 'tag-lazer', tagName: 'Lazer', month: '2026-09', limitAmount: 500, actualAmount: 45 },
      ],
      2270.8,
    );

    expect(totals.totalLimit).toBe('2.300,00');
    expect(totals.used).toBe('2.270,80');
  });
});
