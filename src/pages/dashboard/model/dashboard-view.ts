import type { MonthlySummaryDto, PaymentMethodAmountDto, TagAmountDto } from '@/entities/dashboard';
import { getPaymentMethodLabel } from '@/entities/transaction';
import { categoricalColorAt } from '@/constants/theme';
import { formatMonthShort } from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/format';

// Kept as plain numbers (0-100), not "45%" strings -- React Native's DimensionValue type only
// accepts a `${number}%` template literal, which a value built from a pre-formatted string
// field can't statically satisfy. Callers format the "%" suffix inline at the style/text site.
const PercentMultiplier = 100;

/**
 * One wedge of the "gasto por categoria" donut, described as fractions (0-1) of the full circle
 * rather than pixel/angle values -- keeps this pure and testable, independent of whatever radius
 * the component renders the donut at.
 */
export type CategoryDonutSegment = {
  tagId: string;
  name: string;
  percentageLabel: string;
  color: string;
  lengthFraction: number;
  offsetFraction: number;
};

export type CategoryDonut = { totalLabel: string; segments: CategoryDonutSegment[] };

/** Segments ordered largest-first, each carrying where it starts along the circle so the component can stack them without repeating that math. */
export function buildCategoryDonut(spendByTag: TagAmountDto[]): CategoryDonut {
  const total = spendByTag.reduce((sum, tag) => sum + tag.amount, 0);
  const sortedByAmountDescending = [...spendByTag].sort((a, b) => b.amount - a.amount);

  const segments: CategoryDonutSegment[] = [];
  let cumulativeFraction = 0;
  for (const [index, tag] of sortedByAmountDescending.entries()) {
    let lengthFraction = 0;
    if (total !== 0) {
      lengthFraction = tag.amount / total;
    }

    segments.push({
      tagId: tag.tagId,
      name: tag.tagName,
      percentageLabel: `${Math.round(lengthFraction * PercentMultiplier)}%`,
      color: categoricalColorAt(index),
      lengthFraction,
      offsetFraction: cumulativeFraction,
    });

    cumulativeFraction += lengthFraction;
  }

  return { totalLabel: formatAmount(total), segments };
}

export type PaymentMethodSegment = { paymentMethod: string; label: string; value: string; widthPct: number; color: string };

/** Each segment's width is its share of the total, so the row of segments fills exactly 100%. */
export function buildPaymentMethodSegments(spendByPaymentMethod: PaymentMethodAmountDto[]): PaymentMethodSegment[] {
  const total = spendByPaymentMethod.reduce((sum, entry) => sum + entry.amount, 0);

  return [...spendByPaymentMethod]
    .sort((a, b) => b.amount - a.amount)
    .map((entry, index) => buildPaymentMethodSegment(entry, total, index));
}

function buildPaymentMethodSegment(entry: PaymentMethodAmountDto, total: number, colorIndex: number): PaymentMethodSegment {
  let widthPct = 0;
  if (total !== 0) {
    widthPct = (entry.amount / total) * 100;
  }

  return {
    paymentMethod: entry.paymentMethod,
    label: getPaymentMethodLabel(entry.paymentMethod),
    value: formatAmount(entry.amount),
    widthPct,
    color: categoricalColorAt(colorIndex),
  };
}

export type MonthBar = { month: string; label: string; incomeHeightPct: number; expenseHeightPct: number };

/** Every month's income/expense bar height is relative to the single tallest value across the whole window. */
export function buildMonthBars(monthlySummary: MonthlySummaryDto[]): MonthBar[] {
  const maxValue = Math.max(1, ...monthlySummary.flatMap((entry) => [entry.income, entry.expense]));

  return monthlySummary.map((entry) => {
    const [year, month] = entry.month.split('-').map(Number);
    return {
      month: entry.month,
      label: formatMonthShort(year, month),
      incomeHeightPct: (entry.income / maxValue) * 100,
      expenseHeightPct: (entry.expense / maxValue) * 100,
    };
  });
}
