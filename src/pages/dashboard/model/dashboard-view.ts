import type { MonthlySummaryDto, PaymentMethodAmountDto, TagAmountDto } from '@/entities/dashboard';
import { getPaymentMethodLabel } from '@/entities/transaction';
import { categoricalColorAt } from '@/constants/theme';
import { formatMonthShort } from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/format';

// Kept as plain numbers (0-100), not "45%" strings -- React Native's DimensionValue type only
// accepts a `${number}%` template literal, which a value built from a pre-formatted string
// field can't statically satisfy. Callers format the "%" suffix inline at the style/text site.
export type CategoryBar = { tagId: string; name: string; value: string; widthPct: number };

/** Each bar's width is relative to the largest category, not the total -- the biggest spend fills the row. */
export function buildCategoryBars(spendByTag: TagAmountDto[]): CategoryBar[] {
  const maxAmount = Math.max(0, ...spendByTag.map((tag) => tag.amount));

  return [...spendByTag]
    .sort((a, b) => b.amount - a.amount)
    .map((tag) => ({
      tagId: tag.tagId,
      name: tag.tagName,
      value: formatAmount(tag.amount),
      widthPct: maxAmount === 0 ? 0 : (tag.amount / maxAmount) * 100,
    }));
}

export type PaymentMethodSegment = { paymentMethod: string; label: string; value: string; widthPct: number; color: string };

/** Each segment's width is its share of the total, so the row of segments fills exactly 100%. */
export function buildPaymentMethodSegments(spendByPaymentMethod: PaymentMethodAmountDto[]): PaymentMethodSegment[] {
  const total = spendByPaymentMethod.reduce((sum, entry) => sum + entry.amount, 0);

  return [...spendByPaymentMethod]
    .sort((a, b) => b.amount - a.amount)
    .map((entry, index) => ({
      paymentMethod: entry.paymentMethod,
      label: getPaymentMethodLabel(entry.paymentMethod),
      value: formatAmount(entry.amount),
      widthPct: total === 0 ? 0 : (entry.amount / total) * 100,
      color: categoricalColorAt(index),
    }));
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
